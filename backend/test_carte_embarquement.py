# test_carte_embarquement.py

from app.core.database import SessionLocal
from app.models.passager import Passager
from app.models.reclamation import Reclamation
from app.models.carte_embarquement import CarteEmbarquement
import secrets

print("🧪 Test Carte Embarquement...")
print("=" * 60)

db = SessionLocal()

try:
    # 1. Créer passager
    passager = Passager(
        nom="Mansouri",
        prenom="Leila",
        email="leila@gmail.com",
        telephone="+216 20 123 456"
    )
    db.add(passager)
    db.commit()
    db.refresh(passager)
    print(f"✅ Passager créé (ID: {passager.id})")
    
    # 2. Créer réclamation
    reclamation = Reclamation(
        public_token=secrets.token_hex(16),
        passager_id=passager.id,
        description="Bagage endommagé sur le vol BJ305",
        langue="fr"
    )
    db.add(reclamation)
    db.commit()
    db.refresh(reclamation)
    print(f"✅ Réclamation créée (ID: {reclamation.id})")
    
    # 3. Créer carte (données OCR)
    carte = CarteEmbarquement(
        reclamation_id=reclamation.id,
        file_url="https://minio.example.com/cartes/leila_carte.jpg",
        passenger_name="MANSOURI LEILA",
        vol="BJ305",
        departure_airport="TUN",
        departure_time="10:45",
        ocr_confidence=0.88
    )
    db.add(carte)
    db.commit()
    db.refresh(carte)
    
    print(f"✅ Carte embarquement créée !")
    print(f"   ID        : {carte.id}")
    print(f"   Passager  : {carte.passenger_name}")
    print(f"   Vol       : {carte.vol}")
    print(f"   Départ    : {carte.departure_airport} à {carte.departure_time}")
    print(f"   Confiance : {carte.ocr_confidence}")
    
    # 4. Test relation
    print(f"\n🔗 Test relation :")
    print(f"   Carte → Réclamation : #{carte.reclamation.id}")
    print(f"   Réclamation → Carte : Vol {reclamation.carte_embarquement.vol}")
    
    print(f"\n📊 Total cartes : {db.query(CarteEmbarquement).count()}")
    
except Exception as e:
    print(f"❌ Erreur : {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

print("=" * 60)