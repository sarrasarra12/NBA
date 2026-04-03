from app.core.database import engine, Base
from sqlalchemy import text

# Importer TOUS les modèles explicitement
from app.models.category import Category
from app.models.departement import Departement
from app.models.passager import Passager
from app.models.agent_humain import AgentHumain
from app.models.reclamation import Reclamation
from app.models.carte_embarquement import CarteEmbarquement
from app.models.piece_jointe import PieceJointe
from app.models.reponse import Reponse
from app.models.reponse_humaine import ReponseHumaine
from app.models.reponse_ia import ReponseIA

print("Suppression des anciennes tables...")
with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE"))
    conn.execute(text("CREATE SCHEMA public"))
    conn.commit()
print("✅ Schema recréé !")

Base.metadata.create_all(bind=engine)
print("✅ Tables recréées !")