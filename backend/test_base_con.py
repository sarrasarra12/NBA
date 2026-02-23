# test_base_connaissance.py

from app.core.database import SessionLocal
from app.models import BaseConnaissance

print("🧪 Test Base Connaissance...")
print("=" * 60)

db = SessionLocal()

try:
    # Créer des cas historiques pour RAG
    cas1 = BaseConnaissance(
        categorie="bagage_endommage",
        num_vol="BJ509",
        type_probleme="Valise endommagée avec déchirure importante",
        solution="Compensation de 300 EUR accordée + réparation prise en charge",
        compensation_validee=300.00
    )
    
    cas2 = BaseConnaissance(
        categorie="retard_vol",
        num_vol="BJ305",
        type_probleme="Vol retardé de 4 heures",
        solution="Compensation de 250 EUR selon règlement EU261",
        compensation_validee=250.00
    )
    
    cas3 = BaseConnaissance(
        categorie="bagage_perdu",
        num_vol="BJ712",
        type_probleme="Bagage non arrivé après 48h",
        solution="Compensation de 600 EUR + remboursement achats urgents",
        compensation_validee=600.00
    )
    
    db.add_all([cas1, cas2, cas3])
    db.commit()
    
    print(f"✅ 3 cas historiques ajoutés")
    
    # Afficher
    print(f"\n📚 Base de connaissance :")
    tous_les_cas = db.query(BaseConnaissance).all()
    for cas in tous_les_cas:
        print(f"\n   Catégorie    : {cas.categorie}")
        print(f"   Vol          : {cas.num_vol}")
        print(f"   Problème     : {cas.type_probleme}")
        print(f"   Compensation : {cas.compensation_validee} EUR")
    
    print(f"\n📊 Total cas dans la base : {db.query(BaseConnaissance).count()}")
    
    print(f"\n💡 Ces cas seront utilisés par :")
    print(f"   - ChromaDB pour indexation vectorielle")
    print(f"   - Groq pour générer des réponses similaires")
    
except Exception as e:
    print(f"❌ Erreur : {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

print("=" * 60)