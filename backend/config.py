from pydantic import BaseModel
import os

SECRET_KEY = os.getenv("SECRET_KEY", "clave_secreta")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Token válido por 1 hora
