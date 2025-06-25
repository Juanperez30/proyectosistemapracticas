from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME"),
    MAIL_PORT=int(os.getenv("MAIL_PORT")),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)
class EmailSchema(BaseModel):
    email: str
    subject: str
    body: str

async def enviar_correo(destinatario: str, asunto: str, mensaje: str):
    message = MessageSchema(
        subject=asunto,
        recipients=[destinatario],
        body=mensaje,
        subtype="plain"
    )
    fm = FastMail(conf)
    await fm.send_message(message)
