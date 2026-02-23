# test_database.py
from app.core.database import engine
from sqlalchemy import text


print("🐘 Test connexion PostgreSQL...")
print("=" * 50)

try:
    # Tester connexion
    connection = engine.connect()
    print("✅ Connexion PostgreSQL réussie !")
    print(f"📁 Base de données : nouvelair_claims_db")
    
    # Tester requête
    result = connection.execute(text("SELECT version();"))
    version = result.fetchone()[0]
    print(f"🐘 Version PostgreSQL :")
    print(f"   {version[:70]}...")
    
    # Fermer
    connection.close()
    print("✅ Connexion fermée proprement")
    
except Exception as e:
    print(f"❌ ERREUR : {e}")
    print("\n⚠️ Vérifie :")
    print("1. Le mot de passe dans app/core/database.py ligne 18")
    print("2. PostgreSQL est démarré (Services Windows)")
    print("3. La base 'nouvelair_claims_db' existe dans pgAdmin")

print("=" * 50)