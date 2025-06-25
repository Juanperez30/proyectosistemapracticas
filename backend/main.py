from fastapi import Depends,FastAPI, HTTPException
from sqlalchemy.orm import Session
from database import get_db, SessionLocal, engine
import models, crud, schemas
from routes import router 
from routes_estudiantes import router as router_estudiantes
from routes_admins import router_admin
from routes_usuario import router_usuario
from routes_practicas import router_practicas
from routes_convenios import router_convenio
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()
app.include_router(router, prefix="/api", tags=["empresas"])
app.include_router(router_estudiantes, prefix="/api", tags=["estudiantes"])
app.include_router(router_admin, prefix="/api", tags=["administradores"])
app.include_router(router_usuario, prefix="/api", tags=["usuarios"])
app.include_router(router_practicas, prefix="/api", tags=["practicas"])
app.include_router(router_convenio, prefix="/api", tags=["convenios"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.get("/")
def read_root():
    return {"message": "API funcionando"}

# ✅ Asegurar que las tablas se creen en la base de datos
models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

@app.get("/ping")
def ping(db: Session = Depends(get_db)):
    return {"message": "Conexion exitosa con la base de datos"}

models.Base.metadata.create_all(bind=engine)

@app.post("/empresas/", response_model=schemas.EmpresaOut)
def crear_empresa(empresa: schemas.EmpresaCreate, db: Session = Depends(get_db)):
    return crud.crear_empresa(db, empresa)

@app.get("/empresas/", response_model=list[schemas.EmpresaOut])
def listar_empresas(db: Session = Depends(get_db)):
    return crud.obtener_empresas(db)

@app.get("/empresas/{empresa_id}", response_model=schemas.EmpresaOut)
def obtener_empresa(empresa_id: int, db: Session = Depends(get_db)):
    empresa = crud.obtener_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return empresa

@app.delete("/empresas/{empresa_id}")
def eliminar_empresa(empresa_id: int, db: Session = Depends(get_db)):
    empresa = crud.eliminar_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return {"detail": "Empresa eliminada"}
