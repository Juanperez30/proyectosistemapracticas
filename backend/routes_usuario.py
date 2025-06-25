from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
from schemas import UsuarioCreate, UsuarioOut
from crud import crear_usuario, obtener_usuario_por_correo, generar_codigo, get_password_hash
from fastapi.security import OAuth2PasswordRequestForm
from auth import crear_token, verificar_token, verify_password
from schemas import UsuarioBase, VerificacionCodigo, CorreoEntrada, CambiarContrasena, CorreoRecuperacion
from models import Usuario 
import random
from mail_config import enviar_correo
import string


router_usuario = APIRouter()

@router_usuario.post("/registro", response_model=UsuarioOut)
async def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    usuario_existente = obtener_usuario_por_correo(db, usuario.correo)
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    return await crear_usuario(db, usuario)


@router_usuario.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Buscar al usuario por correo
    usuario = db.query(Usuario).filter(Usuario.correo == form_data.username).first()  # Corregido: usar 'Usuario' en lugar de 'usuario'
    if not usuario or not verify_password(form_data.password, usuario.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    # if not usuario.verificado:
    #     raise HTTPException(status_code=403, detail="Cuenta no verificada. Revisa tu correo.")
    # Determinar el tipo de usuario y generar el token
    tipo_usuario = None
    if usuario.es_estudiante:
        tipo_usuario = "estudiante"
    elif usuario.es_empresa:
        tipo_usuario = "empresa"
    elif usuario.es_admin:
        tipo_usuario = "admin"

    # Crear token con el correo y el tipo de usuario
    token = crear_token({"sub": usuario.correo, "tipo": tipo_usuario, "usuario_id": usuario.id})
    return {"access_token": token, "token_type": "bearer", "tipo": tipo_usuario, "usuario_id": usuario.id}


@router_usuario.post("/verificar-codigo/")
def verificar_codigo(
    datos: VerificacionCodigo,
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter_by(correo=datos.correo).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if usuario.verificado:
        raise HTTPException(status_code=400, detail="El usuario ya está verificado.")
    if usuario.codigo_verificacion != datos.codigo:
        raise HTTPException(status_code=400, detail="Código incorrecto")

    usuario.verificado = True
    usuario.codigo_verificacion = None
    db.commit()

    return {"mensaje": "Cuenta verificada correctamente"}


@router_usuario.post("/reenviar-codigo/")
async def reenviar_codigo_verificacion(
    datos: CorreoEntrada,
    db: Session = Depends(get_db)
):
    correo = datos.correo

    usuario = db.query(Usuario).filter_by(correo=correo).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if usuario.verificado:
        raise HTTPException(status_code=400, detail="El usuario ya ha sido verificado")

    nuevo_codigo = ''.join(random.choices(string.digits, k=6))
    usuario.codigo_verificacion = nuevo_codigo
    db.commit()

    mensaje = (
        f"Tu nuevo código de verificación es: {nuevo_codigo}.\n\n"
        f"Si no solicitaste esto, ignora este correo."
    )

    await enviar_correo(
        destinatario=correo,
        asunto="Nuevo código de verificación",
        mensaje=mensaje
    )

    return {"mensaje": "Nuevo código enviado correctamente"}


@router_usuario.post("/recuperar-contrasena/")
async def enviar_codigo_recuperacion(
    datos: CorreoRecuperacion,
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter_by(correo=datos.correo).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Correo no registrado")

    codigo = ''.join(random.choices(string.digits, k=6))
    usuario.codigo_verificacion = codigo
    db.commit()

    mensaje = f"Tu código para restablecer la contraseña es: {codigo}"
    await enviar_correo(
        destinatario=datos.correo,
        asunto="Recuperación de contraseña",
        mensaje=mensaje
    )

    return {"mensaje": "Código enviado al correo"}


@router_usuario.post("/cambiar-contrasena/")
def cambiar_contrasena(datos: CambiarContrasena, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter_by(correo=datos.correo).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.hashed_password = get_password_hash(datos.nueva_contrasena)
    db.commit()

    return {"mensaje": "Contraseña actualizada correctamente"}



@router_usuario.post("/verificar-codigo-contrasena/")
def verificar_codigo(
    datos: VerificacionCodigo,
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter_by(correo=datos.correo).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if usuario.codigo_verificacion != datos.codigo:
        raise HTTPException(status_code=400, detail="Código incorrecto")
    
    usuario.codigo_verificacion = None  # Borra el código
    db.commit()

    return {"validado": True}
