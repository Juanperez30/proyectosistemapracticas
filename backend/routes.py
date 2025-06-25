from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from database import get_db  # ✅ Importar la conexión a la DB
from schemas import EmpresaBase as EmpresaSchema, EmpresaCreate, EmpresaValidado
from crud import obtener_empresas, obtener_empresa, actualizar_empresa, eliminar_empresa, crear_empresa_db
from fastapi.security import OAuth2PasswordRequestForm
from auth import crear_token, verificar_token, obtener_usuario_actual
from schemas import UsuarioBase, PostulacionOut, EmpresaOut
from models import Empresa, Usuario, Practica, Postulacion, Estudiante, Convenio

router = APIRouter()

@router.get("/empresas/", response_model=List[EmpresaSchema], dependencies=[Depends(obtener_usuario_actual)])
def listar_empresas(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return obtener_empresas(db, skip, limit)



@router.post("/empresas/", response_model=EmpresaSchema)
async def crear_empresa(empresa: EmpresaCreate, db: Session = Depends(get_db)):
    return await crear_empresa_db(db, empresa)



@router.get("/empresas/{empresa_id}", response_model=EmpresaValidado, dependencies=[Depends(obtener_usuario_actual)])
def obtener_una_empresa(empresa_id: int, db: Session = Depends(get_db)):
    empresa = obtener_empresa(db, empresa_id)
    if empresa is None:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    usuario = db.query(Usuario).filter_by(id = empresa.usuario_id).first()

    return{
        "id": empresa.id,
        "nombre": empresa.nombre,
        "verificado": usuario.verificado 
    }



@router.put("/empresas/{empresa_id}", response_model=EmpresaSchema)
def modificar_empresa(
    empresa_id: int,
    empresa: EmpresaCreate,  
    db: Session = Depends(get_db),
    usuario_actual: UsuarioBase = Depends(obtener_usuario_actual)
):
    empresa_actualizada = actualizar_empresa(db, empresa_id, empresa, usuario_actual)
    if empresa_actualizada is None:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return empresa_actualizada

@router.delete("/empresas/{empresa_id}")
def borrar_empresa(
    empresa_id: int, 
    db: Session = Depends(get_db),
    usuario_actual: UsuarioBase = Depends(obtener_usuario_actual)
):
    empresa_eliminada = eliminar_empresa(db, empresa_id, usuario_actual)
    if empresa_eliminada is None:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return {"mensaje": "Empresa eliminada correctamente"}

@router.get("/postulaciones-empresa/", response_model=List[dict])
def obtener_postulaciones_empresa(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_empresa:
        raise HTTPException(status_code=403, detail="No autorizado")

    empresa = db.query(Empresa).filter_by(correo=usuario_actual.correo).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    practicas = db.query(Practica).filter_by(id_empresa=empresa.id).all()
    practicas_ids = [p.id for p in practicas]

    postulaciones = db.query(Postulacion).filter(Postulacion.id_practica.in_(practicas_ids)).all()

    resultado = []
    for post in postulaciones:
        estudiante = db.query(Estudiante).filter_by(id=post.id_estudiante).first()
        practica = db.query(Practica).filter_by(id=post.id_practica).first()

        resultado.append({
            "id": post.id,
            "estado": post.estado,
            "hoja_de_vida": post.hoja_de_vida,
            "estudiante_nombre": estudiante.nombre if estudiante else "Desconocido",
            "estudiante_correo": estudiante.correo if estudiante else "Desconocido",
            "practica_nombre": practica.nombre if practica else "Desconocido"
        })

    return resultado

@router.get("/empresa/verificar-convenio")
def verificar_convenio(
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_empresa:
        raise HTTPException(status_code=403, detail="No autorizado")

    empresa = db.query(Empresa).filter_by(correo=usuario_actual.correo).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    return {"convenio": empresa.convenio}

@router.get("/empresas-con-convenio", response_model=List[EmpresaOut])
def obtener_empresas_con_convenio(db: Session = Depends(get_db)):
    convenios = db.query(Convenio).filter_by(estado='aprobado').all()
    empresas = [conv.empresa for conv in convenios if conv.empresa]
    return empresas
