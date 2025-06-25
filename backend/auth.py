from datetime import datetime, timedelta
from jose import JWTError, jwt
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from schemas import UsuarioBase
from passlib.context import CryptContext
from crud import obtener_usuario_por_correo
from fastapi import Security, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from database import get_db
from sqlalchemy.orm import Session


def crear_token(datos: dict):
    to_encode = datos.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return UsuarioBase(**payload)
    except JWTError:
        return None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña en texto plano coincide con su versión encriptada."""
    return pwd_context.verify(plain_password, hashed_password)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def obtener_usuario_actual(token: str = Security(oauth2_scheme), db: Session = Depends(get_db)):
    """Verifica el token y obtiene el usuario con su rol."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        correo: str = payload.get("sub")
        if correo is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="No se pudo validar el token")

    usuario = obtener_usuario_por_correo(db, correo)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    
    return usuario  # Retorna el objeto usuario con su rol
