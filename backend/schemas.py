from pydantic import BaseModel, EmailStr, field_validator, validator
import re
from datetime import date
from typing import List, Optional
from fastapi import UploadFile


######################## EMPRESA ##########################
class EmpresaBase(BaseModel):
    nombre: str
    correo: EmailStr

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaOut(EmpresaBase):
    id: int
    validado: bool

    class Config:
        from_attributes = True
        orm_mode = True
        
class EmpresaValidado(BaseModel):
    id: int
    nombre: str
    verificado: bool  # <--- nuevo campo

    class Config:
        orm_mode = True        

####################### ESTUDIANTE ########################
class EstudianteBase(BaseModel):
    id: int
    nombre: str
    correo: EmailStr
    validado: bool

    class Config:
        from_attributes = True


class EstudianteBaseValidado(BaseModel):
    id: int
    nombre: str
    correo: EmailStr
    validado: bool
    verificado: bool  # <--- nuevo campo

    class Config:
        orm_mode = True


class EstudianteCreate(BaseModel):
    nombre: str
    correo: EmailStr
    cedula: str
    semestre: str
    carrera: str
    codigo: str

class EstudianteOut(EstudianteBase):
    id: int

    class Config:
        from_attributes = True
        

class EstudianteEnPracticaOut(BaseModel):
    nombre_estudiante: str
    correo_estudiante: str
    carrera: str
    empresa: str
    nombre_practica: str
    fecha_inicio: date
    fecha_fin: date
    estado: str  # "en curso" o "finalizada"

    class Config:
        orm_mode = True
        
        
        
##################### ADMIN ######################        

from pydantic import BaseModel, EmailStr

class AdministradorCreate(BaseModel):
    nombre: str
    correo: EmailStr

class AdministradorOut(AdministradorCreate):
    id: int

    class Config:
        from_attributes = True





############################# USUARIOS ################################


class UsuarioBase(BaseModel):
    correo: EmailStr

class UsuarioCreate(UsuarioBase):
    password: str
    es_admin: bool = False
    es_estudiante: bool = False
    es_empresa: bool = False

class UsuarioOut(UsuarioBase):
    id: int
    es_admin: bool
    es_estudiante: bool
    es_empresa: bool

    class Config:
        from_attributes = True


class VerificacionCodigo(BaseModel):
    correo: str
    codigo: str

################# POSTULACIONES ##########################

class PracticaBase(BaseModel):
    nombre: str
    descripcion: str
    salario: float
    fecha_inicio: date
    fecha_fin: date
    fecha_cierre: date
    limite_estudiantes: int
    
    @field_validator('fecha_cierre')
    def validar_fecha_cierre(cls, v, info):
        fecha_inicio = info.data.get('fecha_inicio')
        if fecha_inicio and v >= fecha_inicio:
            raise ValueError('La fecha de cierre debe ser anterior a la fecha de inicio')
        return v

class PracticaCreate(PracticaBase):
    pass

class PracticaOut(PracticaBase):
    id: int
    id_empresa: int

    class Config:
        from_attributes = True
        
        
    
class PostulacionOutAdmin(BaseModel):
    id: int
    estado: str
    estudiante: EstudianteOut
    hoja_de_vida: str

    class Config:
        orm_mode = True            
        
class PracticaConPostulacionesOut(BaseModel):
    id: int
    nombre: str
    id_empresa: int
    empresa: EmpresaOut
    limite_estudiantes: Optional[int]
    postulaciones: List[PostulacionOutAdmin]

    class Config:
        orm_mode = True        



class PostulacionCreate(BaseModel):
    id_practica: int
    
class PostulacionOut(BaseModel):
    id_practica: int

    class Config:
        from_attributes = True
        
class EstadoPostulacion(BaseModel):
    estado: str
        


class EstudianteSimpleOut(BaseModel): ### esto esta medio mal pero espero no cause problemas
    id: int
    nombre: str
    correo: str

    class Config:
        from_attributes = True
        
        
################### CONVENIOS ###############################

class ConvenioDocs(BaseModel):
    certificado_existencia: Optional[UploadFile]
    rut: Optional[UploadFile]
    id_representante: Optional[UploadFile]
    antecedentes_disciplinarios_entidad: Optional[UploadFile]
    antecedentes_disciplinarios_representante: Optional[UploadFile]
    antecedentes_fiscales_entidad: Optional[UploadFile]
    antecedentes_fiscales_representante: Optional[UploadFile]
    antecedentes_judiciales_representante: Optional[UploadFile]
    rnmc: Optional[UploadFile]
    redam: Optional[UploadFile]        
    
class MotivoRechazo(BaseModel):
    empresa_id: int
    motivo: str
    
    
############################# CORREOS ###############################

class CorreoEntrada(BaseModel):
    correo: EmailStr    
    
    

class CambiarContrasena(BaseModel):
    correo: EmailStr
    codigo: str
    nueva_contrasena: str    
    
    

class CorreoRecuperacion(BaseModel):
    correo: EmailStr    