# test_piece_jointe.py

from app.core.database import SessionLocal
from app.models import Passager, Reclamation, PieceJointe  
import secrets

print("🧪 Test Pièces Jointes...")
print("=" * 60)

db = SessionLocal()

try:
    # 1. Passager
    passager = Passager(
        nom="Nasri",
        prenom="Karim",
        email="karim@gmail.com",
        telephone="+216 22 333 444"
    )
    db.add(passager)
    db.commit()
    db.refresh(passager)
    print(f"✅ Passager créé (ID: {passager.id})")
    
    # 2. Réclamation
    reclamation = Reclamation(
        public_token=secrets.token_hex(16),
        passager_id=passager.id,
        description="Bagage endommagé",
        langue="fr"
    )
    db.add(reclamation)
    db.commit()
    db.refresh(reclamation)
    print(f"✅ Réclamation créée (ID: {reclamation.id})")
    
    # 3. Pièces jointes (max 3)
    pieces = [
        PieceJointe(
            reclamation_id=reclamation.id,
            nom_fichier="bagage_photo1.jpg",
            type_fichier="image/jpeg",
            url_stockage="https://minio.example.com/pieces/bagage1.jpg"
        ),
        PieceJointe(
            reclamation_id=reclamation.id,
            nom_fichier="facture_duty.jpg",
            type_fichier="image/jpeg",
            url_stockage="https://minio.example.com/pieces/facture.jpg"
        ),
        PieceJointe(
            reclamation_id=reclamation.id,
            nom_fichier="recu_taxi.jpg",
            type_fichier="image/jpeg",
            url_stockage="https://minio.example.com/pieces/recu.jpg"
        )
    ]
    
    for piece in pieces:
        db.add(piece)
    
    db.commit()
    print(f"✅ 3 pièces jointes créées")
    
    # 4. Vérifier
    print(f"\n📎 Pièces de la réclamation #{reclamation.id} :")
    for i, piece in enumerate(reclamation.pieces_jointes, 1):
        print(f"   {i}. {piece.nom_fichier}")
    
    print(f"\n📊 Total : {len(reclamation.pieces_jointes)} pièces (max 3)")
    
except Exception as e:
    print(f"❌ Erreur : {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

print("=" * 60)