from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
import os
import shutil
from sqlalchemy.orm import Session
from typing import List
from database import get_db  
from schemas import EstudianteBaseValidado,EstudianteBase, EstudianteCreate, UsuarioBase, PracticaOut, PostulacionOut, EstudianteEnPracticaOut
from crud import obtener_estudiantes, obtener_estudiante, actualizar_estudiante, eliminar_estudiante, crear_estudiante  
from auth import crear_token, verificar_token, obtener_usuario_actual
from models import Practica, Estudiante, Postulacion, Usuario, Empresa
from datetime import date

UPLOAD_DIR_HOJAS = "archivos_hojas_de_vida"
os.makedirs(UPLOAD_DIR_HOJAS, exist_ok=True)


router = APIRouter()

@router.post("/estudiantes/", response_model=EstudianteBase)
async def crear_un_estudiante(estudiante: EstudianteCreate, db: Session = Depends(get_db)):
    return await crear_estudiante(db, estudiante)

@router.get("/estudiantes/", response_model=List[EstudianteBase])
def listar_estudiantes(db: Session = Depends(get_db)):
    return obtener_estudiantes(db)

@router.get("/estudiantes/{estudiante_id}", response_model=EstudianteBaseValidado)
def obtener_un_estudiante(estudiante_id: int, db: Session = Depends(get_db)):    
    estudiante = db.query(Estudiante).filter(Estudiante.usuario_id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    usuario = db.query(Usuario).filter_by(id = estudiante.usuario_id).first()
    
    return{
        "id": estudiante.id,
        "nombre": estudiante.nombre,
        "correo": estudiante.correo,
        "validado": estudiante.validado,
        "verificado": usuario.verificado  # campo de Usuario
    }

@router.put("/estudiantes/{estudiante_id}", response_model=EstudianteBase)
def modificar_estudiante(
    estudiante_id: int,
    estudiante: EstudianteCreate,
    db: Session = Depends(get_db),
    usuario_actual: UsuarioBase = Depends(obtener_usuario_actual)
):
    estudiante_actualizado = actualizar_estudiante(db, estudiante_id, estudiante, usuario_actual)
    if estudiante_actualizado is None:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    return estudiante_actualizado

@router.delete("/estudiantes/{estudiante_id}")
def borrar_estudiante(estudiante_id: int, db: Session = Depends(get_db)):
    estudiante_eliminado = eliminar_estudiante(db, estudiante_id)
    if estudiante_eliminado is None:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    return {"mensaje": "Estudiante eliminado correctamente"}


@router.get("/practicas-aprobadas/", response_model=List[PracticaOut])
def obtener_practicas_aprobadas(db: Session = Depends(get_db)):
    return db.query(Practica).filter(Practica.aprobado == True).all()

@router.post("/postular/", response_model=dict)
def postular_a_practica(
    id_practica: int = Form(...),
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_estudiante:
        raise HTTPException(status_code=403, detail="No autorizado")    

    estudiante = db.query(Estudiante).filter_by(correo=usuario_actual.correo).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    
    postulacion_existente = db.query(Postulacion).filter_by(
        id_estudiante=estudiante.id,
        id_practica=id_practica
    ).first()

    if postulacion_existente:
        raise HTTPException(status_code=400, detail="Ya estás inscrito a esta práctica.")

    # Guardar PDF
    filename = f"{estudiante.id}_{id_practica}_{archivo.filename}"
    filepath = os.path.join(UPLOAD_DIR_HOJAS, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(archivo.file, buffer)

    # Guardar en la base de datos
    postulacion = Postulacion(
        id_estudiante=estudiante.id,
        id_practica=id_practica,
        hoja_de_vida=filename
    )
    db.add(postulacion)
    db.commit()

    return {"mensaje": "Postulación realizada exitosamente"}

@router.get("/mis-postulaciones", response_model=List[PostulacionOut])
def obtener_postulaciones_estudiante(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_estudiante:
        raise HTTPException(status_code=403, detail="No autorizado")

    estudiante = db.query(Estudiante).filter_by(correo=usuario_actual.correo).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    return db.query(Postulacion).filter_by(id_estudiante=estudiante.id).all()


@router.get("/estudiantes-en-practica", response_model=List[EstudianteEnPracticaOut])
def listar_estudiantes_en_practica(db: Session = Depends(get_db)):
    postulaciones = (
        db.query(Postulacion)
        .join(Estudiante, Estudiante.id == Postulacion.id_estudiante)
        .join(Practica, Practica.id == Postulacion.id_practica)
        .join(Empresa, Empresa.id == Practica.id_empresa)
        .filter(Postulacion.estado == "aceptado")
        .all()
    )

    hoy = date.today()
    resultado = []
    for p in postulaciones:
        estado = "en curso" if p.practica.fecha_fin >= hoy else "finalizada"
        resultado.append(EstudianteEnPracticaOut(
            nombre_estudiante=p.estudiante.nombre,
            correo_estudiante=p.estudiante.correo,
            carrera=p.estudiante.carrera,
            empresa=p.practica.empresa.nombre,
            nombre_practica=p.practica.nombre,
            fecha_inicio=p.practica.fecha_inicio,
            fecha_fin=p.practica.fecha_fin,
            estado=estado
        ))
    
    return resultado