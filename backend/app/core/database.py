from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker , declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
#URL CONNEXION POSTGRESQL
DATABASE_URL = os.getenv("DATABASE_URL")

#crée le moteur de connexion à la base de données 
engine = create_engine(
    DATABASE_URL,
    echo=True, #afficher les requette SQL
    pool_pre_ping=True  #vérifier connexion avant utilisation 
)
#crée une session de connexion à la base de données
SessionLocal = sessionmaker(
    autocommit=False, #Ne pas sauvegarder automatiquement
    autoflush=False,  #Ne pas envoyer automatiquemnt
    bind=engine      #lier au moteur PostgreqSQL
)
#Base de données pour les modèles SQLALCHEMY
Base = declarative_base()
#Fonction pour obtenir une session de connexiuon à la base de donnée 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()