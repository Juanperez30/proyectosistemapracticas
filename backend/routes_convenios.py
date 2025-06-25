from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import os
from uuid import uuid4
from models import Convenio, Empresa
from database import get_db
from auth import obtener_usuario_actual
from fastapi.responses import FileResponse


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
    "redam",
    "motivo_rechazo"
]

router_convenio = APIRouter()

UPLOAD_DIR = "archivos_convenio"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router_convenio.get("/convenio/")
def obtener_convenio(db: Session = Depends(get_db), usuario_actual = Depends(obtener_usuario_actual)):
    if not usuario_actual.es_empresa:
        raise HTTPException(status_code=403, detail="No autorizado")

    empresa = db.query(Empresa).filter_by(correo=usuario_actual.correo).first()
    convenio = db.query(Convenio).filter_by(empresa_id=empresa.id).first()

    if not convenio:
        return {}

    return {campo: getattr(convenio, campo) for campo in CAMPOS_VALIDOS}


@router_convenio.post("/convenio/subir/")
async def subir_documento(
    tipo: str = Form(...),
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario_actual = Depends(obtener_usuario_actual)
):
    if tipo not in CAMPOS_VALIDOS:
        raise HTTPException(status_code=400, detail="Tipo de documento no válido")

    if not usuario_actual.es_empresa:
        raise HTTPException(status_code=403, detail="No autorizado")

    empresa = db.query(Empresa).filter_by(correo=usuario_actual.correo).first()
    convenio = db.query(Convenio).filter_by(empresa_id=empresa.id).first()
    if not convenio:
        convenio = Convenio(empresa_id=empresa.id)
        db.add(convenio)
        db.commit()
        db.refresh(convenio)

    filename = f"{uuid4().hex}_{archivo.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(await archivo.read())

    setattr(convenio, tipo, filename)
    db.commit()

    return {"mensaje": f"Documento '{tipo}' subido correctamente."}


@router_convenio.post("/convenio/enviar/")
def enviar_para_revision(
    db: Session = Depends(get_db),
    usuario_actual = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_empresa:
        raise HTTPException(status_code=403, detail="No autorizado")

    empresa = db.query(Empresa).filter_by(correo=usuario_actual.correo).first()
    convenio = db.query(Convenio).filter_by(empresa_id=empresa.id).first()

    if not convenio:
        raise HTTPException(status_code=404, detail="Convenio no encontrado")

    convenio.motivo_rechazo = " "
    if not all(getattr(convenio, campo) for campo in CAMPOS_VALIDOS):
        raise HTTPException(status_code=400, detail="Faltan documentos para enviar el convenio.")

    convenio.estado = "enviado"
    db.commit()

    return {"mensaje": "Convenio enviado para revisión."}


@router_convenio.get("/convenio/archivo-propio/{campo}")
def descargar_documento(
    campo: str,
    db: Session = Depends(get_db),
    usuario_actual = Depends(obtener_usuario_actual)
):
    if campo not in CAMPOS_VALIDOS:
        raise HTTPException(status_code=400, detail="Campo no válido")

    if not usuario_actual.es_empresa:
        raise HTTPException(status_code=403, detail="No autorizado")

    empresa = db.query(Empresa).filter_by(correo=usuario_actual.correo).first()
    convenio = db.query(Convenio).filter_by(empresa_id=empresa.id).first()

    archivo = getattr(convenio, campo)
    if not archivo:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    filepath = os.path.join(UPLOAD_DIR, archivo)
    return FileResponse(filepath, media_type="application/pdf", filename=archivo)

@router_convenio.get("/convenio/archivo/{id}/{campo}")
def descargar_documento_admin(
    id: int,
    campo: str,
    db: Session = Depends(get_db),
    usuario_actual = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado")

    if campo not in CAMPOS_VALIDOS:
        raise HTTPException(status_code=400, detail="Campo no válido")

    convenio = db.query(Convenio).filter_by(id=id).first()
    if not convenio:
        raise HTTPException(status_code=404, detail="Convenio no encontrado")

    archivo = getattr(convenio, campo)
    if not archivo:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    filepath = os.path.join(UPLOAD_DIR, archivo)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Archivo no encontrado en disco")

    return FileResponse(filepath, media_type="application/pdf", filename=archivo)



@router_convenio.get("/convenio/estado/")
def obtener_estado_convenio(
    db: Session = Depends(get_db),
    usuario_actual = Depends(obtener_usuario_actual)
):
    if not usuario_actual.es_empresa:
        raise HTTPException(status_code=403, detail="No autorizado")

    empresa = db.query(Empresa).filter_by(correo=usuario_actual.correo).first()
    convenio = db.query(Convenio).filter_by(empresa_id=empresa.id).first()

    if not convenio:
        raise HTTPException(status_code=404, detail="Convenio no encontrado")

    return {"estado": convenio.estado}
