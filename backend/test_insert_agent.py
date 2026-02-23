# test_insert_agent.py

"""
Test : Créer un agent dans la base de données
"""

from app.core.database import SessionLocal
from app.models.agent_humain import AgentHumain
from passlib.context import CryptContext

# Contexte pour hasher les passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

print(" Test insertion AgentHumain...")
print("=" * 50)

# Créer session
db = SessionLocal()

try:
    # Créer un superviseur test
    superviseur = AgentHumain(
        nom="Ben Ali",
        prenom="Sami",
        email="superviseur@test.com",
        mot_de_passe=pwd_context.hash("password123"),
        role="superviseur"
    )
    
    db.add(superviseur)
    db.commit()
    db.refresh(superviseur)
    
    print(f" Agent créé avec succès !")
    print(f"   ID    : {superviseur.id}")
    print(f"   Nom   : {superviseur.nom}")
    print(f"   Email : {superviseur.email}")
    print(f"   Role  : {superviseur.role}")
    
    # Vérifier dans la base
    count = db.query(AgentHumain).count()
    print(f"\n Total agents dans la base : {count}")
    
    
except Exception as e:
    print(f" Erreur : {e}")
    db.rollback()
finally:
    db.close()

print("=" * 50)