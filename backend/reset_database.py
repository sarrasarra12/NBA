#supprimer et recreé les tables 

from app.core.database import engine
from app.models import Base 
from app.models.passager import Passager 
from app.models.agent_humain import AgentHumain
from app.models.reclamation import Reclamation
from app.models.carte_embarquement import CarteEmbarquement
from app.models.piece_jointe import PieceJointe

print("🗑️  Suppression des anciennes tables...")
print("=" * 60)

# Supprimer toutes les tables
Base.metadata.drop_all(bind=engine)
print("✅ Tables supprimées")

print("\n🔨 Création des nouvelles tables...")
print("=" * 60)


# Recréer toutes les tables
Base.metadata.create_all(bind=engine)
print(" Tables créées avec succès !")

print("\n Tables disponibles :")
for table_name in sorted(Base.metadata.tables.keys()):
    print(f"   - {table_name}")

print("\n Vérifie dans pgAdmin (Refresh)")
print("=" * 60)