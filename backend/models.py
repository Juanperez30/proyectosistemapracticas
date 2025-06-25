from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Float, Date
from sqlalchemy.orm import relationship
from database import Base

class Estudiante(Base):
    __tablename__ = "estudiantes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    correo = Column(String, unique=True, nullable=False)
    validado = Column(Boolean, default=False)
    cedula = Column(String, nullable = False)
    expedicion_cedula = Column(String, nullable= True)
    semestre = Column(String, nullable = False)
    carrera = Column(String, nullable = False)
    codigo = Column(String,nullable = False)
    
    
    
    # Relación con la tabla de usuarios
    usuario_id = Column(Integer, ForeignKey('usuarios.id'))
    usuario = relationship("Usuario", back_populates="estudiante")
    postulaciones = relationship("Postulacion", back_populates="estudiante")

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    correo = Column(String, unique=True, nullable=False)
    validado = Column(Boolean, default=False)
    convenio = Column(Boolean, default=False)
    
    # Relación con la tabla de usuarios
    usuario_id = Column(Integer, ForeignKey('usuarios.id'))
    usuario = relationship("Usuario", back_populates="empresa")
    
    # Relación con practica
    practicas = relationship("Practica", back_populates="empresa")
    
    # Relacion con convenio
    convenio_obj = relationship("Convenio", back_populates="empresa", uselist=False)



class Administrador(Base):
    __tablename__ = "administradores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    correo = Column(String, unique=True, nullable=False)
    
    # Relación con la tabla de usuarios
    usuario_id = Column(Integer, ForeignKey('usuarios.id'))
    usuario = relationship("Usuario", back_populates="administrador")
            
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    correo = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    es_admin = Column(Boolean, default=False)
    es_estudiante = Column(Boolean, default=False)
    es_empresa = Column(Boolean, default=False)
    codigo_verificacion = Column(String, nullable=True)
    verificado = Column(Boolean, default=False)
    token_verificacion = Column(String, nullable=True)

    # Relaciones uno a uno con las otras tablas
    estudiante = relationship("Estudiante", uselist=False, back_populates="usuario")
    empresa = relationship("Empresa", uselist=False, back_populates="usuario")
    administrador = relationship("Administrador", uselist=False, back_populates="usuario")
    


class Practica(Base):
    __tablename__ = "practicas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=False)
    salario = Column(Float, nullable=True)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    fecha_cierre = Column(Date, nullable=False)
    id_empresa = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    aprobado = Column(Boolean, default=False, nullable=False)
    limite_estudiantes = Column(Integer, nullable=False)


    empresa = relationship("Empresa", back_populates="practicas")
    postulaciones = relationship("Postulacion", back_populates="practica")
    

class Postulacion(Base):
    __tablename__ = "postulaciones"

    id = Column(Integer, primary_key=True, index=True)
    id_estudiante = Column(Integer, ForeignKey("estudiantes.id"), nullable=False)
    id_practica = Column(Integer, ForeignKey("practicas.id"), nullable=False)
    hoja_de_vida = Column(String, nullable=False)  # Ruta o nombre del archivo
    estado = Column(String, default="En proceso", nullable=False)

    estudiante = relationship("Estudiante", back_populates="postulaciones")
    practica = relationship("Practica", back_populates="postulaciones")
   
   
class Convenio(Base):
    __tablename__ = "convenios"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), unique=True)
    empresa = relationship("Empresa", back_populates="convenio_obj")

    # Estado del convenio (pendiente, enviado, aprobado, rechazado)
    estado = Column(String, default="pendiente")

    # Campos para los 10 documentos PDF (guardaremos nombres/rutas)
    certificado_existencia = Column(String, nullable=True)
    rut = Column(String, nullable=True)
    id_representante = Column(String, nullable=True)
    antecedentes_disciplinarios_entidad = Column(String, nullable=True)
    antecedentes_disciplinarios_representante = Column(String, nullable=True)
    antecedentes_fiscales_entidad = Column(String, nullable=True)
    antecedentes_fiscales_representante = Column(String, nullable=True)
    antecedentes_judiciales_representante = Column(String, nullable=True)
    rnmc = Column(String, nullable=True)
    redam = Column(String, nullable=True)
    motivo_rechazo = Column(String, nullable=True)