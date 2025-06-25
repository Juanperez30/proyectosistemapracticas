from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from typing import List
from schemas import AdministradorOut, AdministradorCreate
from crud import crear_administrador, obtener_administrador, obtener_administradores, eliminar_administrador
from models import Usuario, Practica, Postulacion, Empresa, Estudiante, Convenio
from auth import obtener_usuario_actual
from schemas import PracticaConPostulacionesOut, MotivoRechazo, EstadoPostulacion
from fastapi.responses import FileResponse
import os
from mail_config import enviar_correo

UPLOAD_DIR_HOJAS = "archivos_hojas_de_vida"
os.makedirs(UPLOAD_DIR_HOJAS, exist_ok=True)

router_admin = APIRouter()
UPLOAD_DIR = "archivos_convenio"

CAMPOS_VALIDOS = [
    "certificado_existencia",
    "rut",
    "id_representante",
    "antecedentes_disciplinarios_entidad",
    "antecedentes_disciplinarios_representante",
    "antecedentes_fiscales_entidad",
    "antecedentes_fiscales_representante",
    "antecedentes_judiciales_representante",
    "rnmc",
    "redam"
]



@router_admin.post("/administradores/", response_model=AdministradorOut)
def crear_admin(admin: AdministradorCreate, db: Session = Depends(get_db)):
    return crear_administrador(db, admin)

@router_admin.get("/administradores/", response_model=list[AdministradorOut])
def listar_admins(db: Session = Depends(get_db)):
    return obtener_administradores(db)

@router_admin.get("/administradores/{admin_id}", response_model=AdministradorOut)
def obtener_admin(admin_id: int, db: Session = Depends(get_db)):
    admin = obtener_administrador(db, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")
    return admin

@router_admin.delete("/administradores/{admin_id}")
def borrar_admin(admin_id: int, db: Session = Depends(get_db)):
    admin_eliminado = eliminar_administrador(db, admin_id)
    if not admin_eliminado:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")
    return {"mensaje": "Administrador eliminado correctamente"}

@router_admin.get("/practicas-con-postulaciones/", response_model=List[PracticaConPostulacionesOut])
def listar_practicas_con_postulaciones(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado")

    practicas = db.query(Practica).options(
        joinedload(Practica.postulaciones).joinedload(Postulacion.estudiante),
        joinedload(Practica.empresa)
    ).all()
    print("practicas")
    return practicas


@router_admin.put("/postulaciones/{postulacion_id}/estado/")
async def aceptar_postulacion_admin(
    postulacion_id: int,
    datos: EstadoPostulacion,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado")

    postulacion = db.query(Postulacion).get(postulacion_id)
    if not postulacion:
        raise HTTPException(status_code=404, detail="Postulación no encontrada")

    practica = db.query(Practica).get(postulacion.id_practica)
    if not practica:
        raise HTTPException(status_code=404, detail="Práctica no encontrada")

    aceptados = db.query(Postulacion).filter_by(id_practica=practica.id, estado="aceptado").count()

    if practica.limite_estudiantes and aceptados >= practica.limite_estudiantes:
        raise HTTPException(status_code=400, detail="Límite de estudiantes aceptados alcanzado")

    if datos.estado not in ["aceptado", "rechazado"]:
        raise HTTPException(status_code=400, detail="Estado inválido")
    
    postulacion.estado = datos.estado
    db.commit()
    
    estudiante = db.query(Estudiante).filter_by(id=postulacion.id_estudiante).first()
    if estudiante and estudiante.correo:
        if postulacion.estado == "aceptado":
            mensaje = (
                f"Estimado(a) {estudiante.nombre},\n\n"
                f"Nos complace informarte que has sido ACEPTADO(a) en la práctica \"{practica.nombre}\" "
                f"con la empresa \"{practica.empresa.nombre}\".\n\n"
                f"Te invitamos a revisar tu estado dentro del sistema y mantenerte atento a futuros pasos.\n\n"
                f"Atentamente,\nLa Universidad"
            )
            await enviar_correo(
                destinatario=estudiante.correo,
                asunto="Resultado de tu postulación a práctica",
                mensaje=mensaje
            )
        else:
            mensaje = (
                f"Estimado(a) {estudiante.nombre},\n\n"
                f"Lamentamos informarte que has sido RECHAZADO(a) en la práctica \"{practica.nombre}\" "
                f"con la empresa \"{practica.empresa.nombre}\".\n\n"
                f"Te invitamos a revisar tu estado dentro del sistema y mantenerte atento a futuros pasos.\n\n"
                f"Atentamente,\nLa Universidad"
            )
            await enviar_correo(
                destinatario=estudiante.correo,
                asunto="Resultado de tu postulación a práctica",
                mensaje=mensaje
            )

    return {"mensaje": "Estudiante aceptado correctamente"}


@router_admin.get("/admin/convenios-pendientes/")
def listar_convenios_pendientes(
    db: Session = Depends(get_db),
    usuario_actual = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado")

    convenios = (
        db.query(Convenio)
        .join(Empresa)
        .filter(Convenio.estado == "enviado")
        .all()
    )

    return [
        {
            "empresa_id": convenio.empresa.id,
            "nombre_empresa": convenio.empresa.nombre,
            "correo_empresa": convenio.empresa.correo,
        }
        for convenio in convenios
    ]
    
    
@router_admin.get("/admin/convenio/archivo/{empresa_id}/{campo}")
def descargar_documento_admin(
    empresa_id: int,
    campo: str,
    db: Session = Depends(get_db),
    usuario_actual = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado")
    if campo not in CAMPOS_VALIDOS:
        raise HTTPException(status_code=400, detail="Campo no válido")

    convenio = db.query(Convenio).filter_by(empresa_id=empresa_id).first()
    if not convenio:
        raise HTTPException(status_code=404, detail="Convenio no encontrado")

    archivo = getattr(convenio, campo)
    if not archivo:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    filepath = os.path.join(UPLOAD_DIR, archivo)
    return FileResponse(filepath, media_type="application/pdf", filename=archivo)


@router_admin.post("/admin/convenio/aprobar/{empresa_id}")
async def aprobar_convenio(
    empresa_id: int,
    db: Session = Depends(get_db),
    usuario_actual = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado")

    convenio = db.query(Convenio).filter_by(empresa_id=empresa_id).first()
    if not convenio:
        raise HTTPException(status_code=404, detail="Convenio no encontrado")

    convenio.estado = "aprobado"
    empresa = db.query(Empresa).filter_by(id=empresa_id).first()
    empresa.convenio = True  # Para habilitar creación de prácticas

    db.commit()
    
    empresa = db.query(Empresa).filter_by(id=convenio.empresa_id).first()
    if empresa and empresa.correo:
        mensaje = (
            f"Estimado representante de {empresa.nombre},\n\n"
            f"Le informamos que el convenio enviado ha sido APROBADO.\n\n"
            f"Gracias por su participación.\n\nAtentamente,\nLa Universidad"
        )
        await enviar_correo(
            destinatario=empresa.correo,
            asunto="Resultado de revisión del convenio",
            mensaje=mensaje
        )

    return {"mensaje": "Convenio aprobado correctamente."}

@router_admin.post("/admin/convenio/rechazar/")
async def rechazar_convenio(
    datos: MotivoRechazo,
    db: Session = Depends(get_db),
    usuario_actual = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado")

    convenio = db.query(Convenio).filter_by(empresa_id=datos.empresa_id).first()
    if not convenio:
        raise HTTPException(status_code=404, detail="Convenio no encontrado")

    convenio.estado = "rechazado"
    convenio.motivo_rechazo = datos.motivo  # Asegúrate de tener esta columna en la tabla
    db.commit()
    empresa = db.query(Empresa).filter_by(id=convenio.empresa_id).first()
    if empresa and empresa.correo:
        mensaje = (
            f"Estimado representante de {empresa.nombre},\n\n"
            f"Le informamos que el convenio enviado ha sido RECHAZADO.\n\n"
            f"Le invitamos a revisar los motivos del rechazo en el sistema y subir de nuevo los archivos necesarios. \n"
            f"Gracias por su participación.\n\nAtentamente,\nLa Universidad"
        )
        await enviar_correo(
            destinatario=empresa.correo,
            asunto="Resultado de revisión del convenio",
            mensaje=mensaje
        )

    return {"mensaje": "Convenio rechazado correctamente."}

from fastapi.responses import FileResponse

@router_admin.get("/admin/hoja-de-vida/{nombre_archivo}")
def descargar_hoja_de_vida_admin(
    nombre_archivo: str,
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado")

    filepath = os.path.join(UPLOAD_DIR_HOJAS, nombre_archivo)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    return FileResponse(filepath, media_type="application/pdf", filename=nombre_archivo)


