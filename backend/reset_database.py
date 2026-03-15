from app.core.database import engine, Base
from sqlalchemy import text

# Importer TOUS les modèles
from app.models import *

print("🗑️  Suppression des anciennes tables...")

# ✅ DROP CASCADE pour forcer la suppression
with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE"))
    conn.execute(text("CREATE SCHEMA public"))
    conn.commit()

print("✅ Schema recréé proprement")

# Recréer toutes les tables
Base.metadata.create_all(bind=engine)
print("✅ Tables recréées !")