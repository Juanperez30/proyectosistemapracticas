from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db  
from schemas import PracticaOut, PracticaCreate, EstadoPostulacion
from fastapi.responses import FileResponse
from crud import crear_practica, Empresa, Usuario, aprobar_practica, Practica, Estudiante, rechazar_practica
from models import Postulacion
from auth import obtener_usuario_actual
import os
from math import ceil
from mail_config import enviar_correo



from docx import Document
from datetime import datetime

def calcular_duracion_meses(fecha_inicio, fecha_fin):
    dias = (fecha_fin - fecha_inicio).days
    meses = dias / 30  # Aproximación de mes como 30 días
    return ceil(meses)

def generar_acta_practica(datos: dict, plantilla_path="plantilla_acta.docx") -> str:
    doc = Document(plantilla_path)

    # Reemplaza marcadores en todo el documento
    for p in doc.paragraphs:
        for key, value in datos.items():
            if f"{{{{{key}}}}}" in p.text:
                p.text = p.text.replace(f"{{{{{key}}}}}", str(value))

    # Ruta para guardar
    nombre_archivo = f"acta_{datos['codigo']}.docx"
    ruta_salida = os.path.join("actas_practica", nombre_archivo)
    os.makedirs("actas_practica", exist_ok=True)
    doc.save(ruta_salida)

    return ruta_salida

router_practicas = APIRouter()

@router_practicas.post("/practicas/", response_model=PracticaOut)
def registrar_practica(practica: PracticaCreate, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    if not usuario_actual.es_empresa:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    empresa = db.query(Empresa).filter(Empresa.correo == usuario_actual.correo).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    if not empresa.convenio:
        raise HTTPException(status_code=403, detail="Debe tener un convenio aprobado para crear prácticas.")

    return crear_practica(db, practica, empresa.id)

@router_practicas.put("/practicas/{practica_id}/aprobar", response_model=PracticaOut)
async def aprobar_una_practica(practica_id: int, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    if not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado")
    return await aprobar_practica(db, practica_id)

@router_practicas.put("/practicas/{practica_id}/rechazar", response_model=PracticaOut)
async def rechazar_una_practica(practica_id: int, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    if not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado")
    return await rechazar_practica(db, practica_id)

@router_practicas.get("/practicas/pendientes", response_model=List[PracticaOut])
def listar_practicas_pendientes(
    db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    return db.query(Practica).filter(Practica.aprobado == False).all()


# Ver postulaciones a una práctica (solo si la empresa es la dueña)
@router_practicas.get("/practicas/{practica_id}/postulaciones/", response_model=list[dict])
def obtener_postulaciones(practica_id: int, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    if not usuario_actual.es_empresa:
        raise HTTPException(status_code=403, detail="No autorizado")

    empresa = db.query(Empresa).filter_by(correo=usuario_actual.correo).first()
    practica = db.query(Practica).filter_by(id=practica_id, id_empresa=empresa.id).first()
    if not practica:
        raise HTTPException(status_code=404, detail="Práctica no encontrada o no autorizada")

    postulaciones = (
        db.query(Postulacion)
        .filter_by(id_practica=practica_id)
        .join(Estudiante)
        .with_entities(
            Postulacion.id,
            Postulacion.id_estudiante,
            Postulacion.estado,
            Postulacion.hoja_de_vida,
            Estudiante.nombre.label("nombre_estudiante"),
            Estudiante.correo.label("correo_estudiante")
        )
        .all()
    )

    return [dict(p._asdict()) for p in postulaciones]

# # Aceptar o rechazar una postulación
# @router_practicas.put("/postulaciones/{postulacion_id}/estado/")
# async def cambiar_estado_postulacion(
#     postulacion_id: int,
#     datos: EstadoPostulacion,
#     db: Session = Depends(get_db),
#     usuario_actual: Usuario = Depends(obtener_usuario_actual)
# ):
#     if not usuario_actual.es_admin:
#         raise HTTPException(status_code=403, detail="No autorizado")

#     postulacion = db.query(Postulacion).get(postulacion_id)
#     if not postulacion:
#         raise HTTPException(status_code=404, detail="Postulación no encontrada")

#     practica = db.query(Practica).get(postulacion.id_practica)
#     empresa = db.query(Empresa).filter_by(correo=usuario_actual.correo).first()
#     if practica.id_empresa != empresa.id:
#         raise HTTPException(status_code=403, detail="No autorizado")

#     if datos.estado not in ["aceptado", "rechazado"]:
#         raise HTTPException(status_code=400, detail="Estado inválido")

#     postulacion.estado = datos.estado
    
#     db.commit()
    
#     estudiante = db.query(Estudiante).filter_by(id=postulacion.id_estudiante).first()
#     if estudiante and estudiante.correo:
#         if postulacion.estado == "aceptado":
#             mensaje = (
#                 f"Estimado(a) {estudiante.nombre},\n\n"
#                 f"Nos complace informarte que has sido ACEPTADO(a) en la práctica \"{practica.nombre}\" "
#                 f"con la empresa \"{practica.empresa.nombre}\".\n\n"
#                 f"Te invitamos a revisar tu estado dentro del sistema y mantenerte atento a futuros pasos.\n\n"
#                 f"Atentamente,\nLa Universidad"
#             )
#             await enviar_correo(
#                 destinatario=estudiante.correo,
#                 asunto="Resultado de tu postulación a práctica",
#                 mensaje=mensaje
#             )
#         else:
#             mensaje = (
#                 f"Estimado(a) {estudiante.nombre},\n\n"
#                 f"Lamentamos informarte que has sido RECHAZADO(a) en la práctica \"{practica.nombre}\" "
#                 f"con la empresa \"{practica.empresa.nombre}\".\n\n"
#                 f"Te invitamos a revisar tu estado dentro del sistema y mantenerte atento a futuros pasos.\n\n"
#                 f"Atentamente,\nLa Universidad"
#             )
#             await enviar_correo(
#                 destinatario=estudiante.correo,
#                 asunto="Resultado de tu postulación a práctica",
#                 mensaje=mensaje
#             )
#     return {"mensaje": f"Postulación {datos.estado} correctamente"}



# Descargar hoja de vida
@router_practicas.get("/descargar-hoja-de-vida/{filename}")
def descargar_hoja_de_vida(filename: str, usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    if not usuario_actual.es_empresa:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    filepath = os.path.join("archivos_hojas_de_vida", filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    return FileResponse(filepath, media_type="application/octet-stream", filename=filename)


@router_practicas.get("/acta/{postulacion_id}")
def generar_acta(postulacion_id: int, db: Session = Depends(get_db)):
    postulacion = db.query(Postulacion).filter_by(id=postulacion_id).first()
    if not postulacion or postulacion.estado != "aceptado":
        raise HTTPException(status_code=404, detail="Postulación no aceptada o no encontrada")

    estudiante = postulacion.estudiante
    practica = postulacion.practica
    empresa = practica.empresa

    # Reemplaza esto con valores reales si los tienes en base de datos
    datos = {
        "codigo": estudiante.codigo,
        "año": datetime.now().year,
        "mes": f"{datetime.now().month:02d}",
        "dia": f"{datetime.now().day:02d}",
        "mes_texto": datetime.now().strftime("%B"),
        "nombre_estudiante": estudiante.nombre,
        "cedula": estudiante.cedula,
        "expedicion_cedula": "Expedicion cédula",
        "semestre": estudiante.semestre,
        "carrera": estudiante.carrera,
        "tutor_practica": "____Nombre del Tutor _____",
        "empresa": empresa.nombre,
        "duracion": calcular_duracion_meses(practica.fecha_inicio, practica.fecha_fin),
        "nombre_director": "Nombre del Director",  # Puedes cambiar esto a valor fijo o de config
        "fecha_inicio_dia" : f"{practica.fecha_inicio.day:02d}",
        "fecha_inicio_mes": f"{practica.fecha_inicio.month:02d}",
        "fecha_inicio_año": f"{practica.fecha_inicio.year}"
    }

    ruta = generar_acta_practica(datos)
    return FileResponse(ruta, filename=os.path.basename(ruta), media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")