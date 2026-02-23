#s'est un script pour crées toutes le tables dans Postgresql



from app.core.database import engine, Base
from app.models.passager import Passager
from app.models.agent_humain import AgentHumain
from app.models.reclamation  import Reclamation
from app.models.carte_embarquement import CarteEmbarquement

print(" Création des tables dans PostgreSQL...")
print("=" * 60)

# Importer les models pour que SQLAlchemy les connaisse
print(" Models chargés :")
print(f"   - {Passager.__tablename__}")
print(f"   - {AgentHumain.__tablename__}")
print(f"   - {Reclamation.__tablename__}")
print(f"   - {CarteEmbarquement.__tablename__}")


print()

# Cette ligne magique crée TOUTES les tables !
Base.metadata.create_all(bind=engine)

print("Tables créées avec succès dans PostgreSQL !")
print("=" * 60)
print()
