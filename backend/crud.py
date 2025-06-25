from fastapi import HTTPException
from sqlalchemy.orm import Session
from models import Empresa, Estudiante, Usuario, Administrador, Practica
from schemas import EmpresaCreate, EstudianteCreate, UsuarioCreate, AdministradorCreate, UsuarioBase
from passlib.context import CryptContext
from schemas import PracticaCreate
from mail_config import enviar_correo
import random
import uuid


#################################### EMPRESA #######################################

####### CREATE ###########
async def crear_empresa_db(db: Session, empresa: EmpresaCreate):
    usuario = db.query(Usuario).filter(Usuario.correo == empresa.correo).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    codigo_verif = generar_codigo()

    nueva_empresa = Empresa(
        nombre=empresa.nombre,
        correo=empresa.correo,
        validado=False,
        usuario_id=usuario.id        
    )
    usuario.codigo_verificacion = codigo_verif
    db.add(nueva_empresa)
    db.commit()
    db.refresh(nueva_empresa)
    
    await enviar_correo(
        destinatario=usuario.correo,
        asunto="Verifica tu cuenta",
        mensaje=f"Tu código de verificación es: {codigo_verif}"
        )
    return nueva_empresa


######### READ #############

def obtener_empresa(db: Session, empresa_id: int):
    return db.query(Empresa).filter(Empresa.usuario_id == empresa_id).first()

def obtener_empresas(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Empresa).offset(skip).limit(limit).all()

######## UPDATE ##############

def actualizar_empresa(db: Session, empresa_id: int, empresa_actualizada: EmpresaCreate, usuario_actual: UsuarioBase):
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        return None
    
    # ✅ Verificar que solo el dueño de la empresa pueda modificarla
    if empresa.id != usuario_actual.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta empresa")

    empresa.nombre = empresa_actualizada.nombre
    empresa.correo = empresa_actualizada.correo
    db.commit()
    db.refresh(empresa)
    return empresa

######## DELETE ###############

def eliminar_empresa(db: Session, empresa_id: int):
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if empresa:
        db.delete(empresa)
        db.commit()
    return empresa


################################################# ESTUDIANTE ###########################################
def generar_codigo():
    return str(random.randint(100000, 999999))  # Ej: "548293"

async def crear_estudiante(db: Session, estudiante: EstudianteCreate):
    # Verificar si el usuario existe
    usuario = db.query(Usuario).filter(Usuario.correo == estudiante.correo).first()
    
    if not usuario:
        raise HTTPException(status_code=400, detail="El usuario con el correo proporcionado no existe.")
    
    # Verificar si el correo es institucional
    # if not estudiante.correo.endswith("@correo.uis.edu.co"):
    #     raise HTTPException(status_code=400, detail="El correo debe ser institucional (@correo.uis.edu.co)")
    
    codigo_verif = generar_codigo()
    # Crear el nuevo estudiante con el usuario_id
    nuevo_estudiante = Estudiante(
        nombre=estudiante.nombre,
        correo=estudiante.correo,
        validado=False,
        usuario_id=usuario.id,  # Asignar el usuario_id del usuario encontrado
        cedula = estudiante.cedula,
        semestre = estudiante.semestre,
        carrera = estudiante.carrera,
        codigo = estudiante.codigo
    )
    usuario.codigo_verificacion = codigo_verif
    # Guardar en la base de datos
    db.add(nuevo_estudiante)
    db.commit()
    db.refresh(nuevo_estudiante)
    
    await enviar_correo(
        destinatario=usuario.correo,
        asunto="Verifica tu cuenta",
        mensaje=f"Tu código de verificación es: {codigo_verif}"
        )
    return nuevo_estudiante


def obtener_estudiante(db: Session, estudiante_id: int):
    return db.query(Estudiante).filter(Estudiante.id == estudiante_id).first()

def obtener_estudiantes(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Estudiante).offset(skip).limit(limit).all()

def actualizar_estudiante(db: Session, estudiante_id: int, estudiante_actualizado: EstudianteCreate):
    estudiante = db.query(Estudiante).filter(Estudiante.id == estudiante_id).first()
    if not estudiante:
        return None
    estudiante.nombre = estudiante_actualizado.nombre
    estudiante.correo = estudiante_actualizado.correo
    db.commit()
    db.refresh(estudiante)
    return estudiante

def eliminar_estudiante(db: Session, estudiante_id: int):
    estudiante = db.query(Estudiante).filter(Estudiante.id == estudiante_id).first()
    if estudiante:
        db.delete(estudiante)
        db.commit()
    return estudiante


############################### ADMINSITRADOR ##########################################

from sqlalchemy.orm import Session
from models import Administrador
from schemas import AdministradorCreate

def crear_administrador(db: Session, admin: AdministradorCreate):
    usuario = db.query(Usuario).filter(Usuario.correo == admin.correo).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    nuevo_admin = Administrador(
        nombre=admin.nombre,
        correo=admin.correo,
        usuario_id=usuario.id
    )
    db.add(nuevo_admin)
    db.commit()
    db.refresh(nuevo_admin)
    return nuevo_admin

def obtener_administrador(db: Session, admin_id: int):
    return db.query(Administrador).filter(Administrador.id == admin_id).first()

def obtener_administradores(db: Session):
    return db.query(Administrador).all()

def eliminar_administrador(db: Session, admin_id: int):
    admin = db.query(Administrador).filter(Administrador.id == admin_id).first()
    if admin:
        db.delete(admin)
        db.commit()
    return admin


######################## USUARIOS ###############################


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def crear_usuario(db: Session, usuario: UsuarioCreate):
    hashed_password = get_password_hash(usuario.password)
    token = str(uuid.uuid4())
    nuevo_usuario = Usuario(
        correo=usuario.correo,
        hashed_password=hashed_password,
        es_admin=usuario.es_admin,
        es_estudiante=usuario.es_estudiante,
        es_empresa=usuario.es_empresa,
        token_verificacion = token
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario

def obtener_usuario_por_correo(db: Session, correo: str):
    return db.query(Usuario).filter(Usuario.correo == correo).first()

############################# PRACTICAS #################################

def crear_practica(db: Session, practica: PracticaCreate, empresa_id: int):
    nueva_practica = Practica(**practica.dict(), id_empresa=empresa_id)
    db.add(nueva_practica)
    db.commit()
    db.refresh(nueva_practica)
    return nueva_practica

def obtener_practicas_no_aprobadas(db: Session):
    return db.query(Practica).filter(Practica.aprobado == False).all()

async def aprobar_practica(db: Session, practica_id: int):
    practica = db.query(Practica).filter(Practica.id == practica_id).first()
    if not practica:
        raise HTTPException(status_code=404, detail="Práctica no encontrada")
    
    practica.aprobado = True
    db.commit()
    db.refresh(practica)

    empresa = db.query(Empresa).filter_by(id=practica.id_empresa).first()
    if empresa and empresa.correo:
        mensaje = (
            f"Estimado(a) {empresa.nombre},\n\n"
            f"Nos complace informarte que la práctica \"{practica.nombre}\" ha sido ACEPTADA.\n\n"
            f"Los estudiantes podrán inscribirse próximamente, y posteriormente se te notificará "
            f"el listado de los estudiantes seleccionados.\n\n"
            f"Atentamente,\nLa Universidad."
        )
        await enviar_correo(
            destinatario=empresa.correo,
            asunto="Práctica aprobada",
            mensaje=mensaje
        )

    return practica

async def rechazar_practica(db: Session, practica_id: int):
    practica = db.query(Practica).filter(Practica.id == practica_id).first()
    if not practica:
        raise HTTPException(status_code=404, detail="Práctica no encontrada")
    practica.aprobado = False
    db.commit()
    db.refresh(practica)
    
    empresa = db.query(Empresa).filter_by(id=practica.id_empresa).first()
    if empresa and empresa.correo:
        mensaje = (
            f"Estimado(a) {empresa.nombre},\n\n"
            f"Lamentamos informarte que la práctica \"{practica.nombre}\" ha sido RECHAZADA.\n\n"
            f"Debe crear de nuevo una practica cumpliendo con las condiciones necesarias "            
            f"Atentamente,\nLa Universidad."
        )
        await enviar_correo(
            destinatario=empresa.correo,
            asunto="Práctica aprobada",
            mensaje=mensaje
        )
    return practica
