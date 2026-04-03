# app/seeds/seed_admin.py

from app.core.database import SessionLocal
from app.models.agent_humain import AgentHumain, RoleAgent
from app.core.security import hash_password

def seed_admin():
    db = SessionLocal()
    try:
        existing = db.query(AgentHumain).filter(
            AgentHumain.email == "admin@nouvelair.com"
        ).first()

        if existing:
            print("ℹ️ Admin existe déjà")
            return

        admin = AgentHumain(
            nom          = "Admin",
            prenom       = "NouvelAir",
            email        = "admin@nouvelair.com",
            mot_de_passe = hash_password("admin123"),
            role         = RoleAgent.ADMIN,
            is_active    = True
        )
        db.add(admin)
        db.commit()
        print("✅ Compte admin créé !")
        print("   → admin@nouvelair.com / admin123")

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur : {e}")
    finally:
        db.close()