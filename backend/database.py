from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+psycopg2://practicas_user:password123@localhost/practicas_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependencia para obtener una sesión de la BD en cada solicitud
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
