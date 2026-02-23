# test_utilisation_connaissance.py

from app.core.database import SessionLocal
from app.models import (
    Passager, Reclamation, DecisionIA, 
    BaseConnaissance, UtilisationConnaissance
)
import secrets

print("🧪 Test Utilisation Connaissance (RAG Log)...")
print("=" * 60)

db = SessionLocal()

try:
    # 1. Passager
    passager = Passager(
        nom="Slim",
        prenom="Yasmine",
        email="yasmine@gmail.com",
        telephone="+216 55 888 999"
    )
    db.add(passager)
    db.commit()
    db.refresh(passager)
    print(f"✅ Passager créé (ID: {passager.id})")
    
    # 2. Réclamation
    reclamation = Reclamation(
        public_token=secrets.token_hex(16),
        passager_id=passager.id,
        description="Bagage endommagé avec grosse déchirure",
        langue="fr"
    )
    db.add(reclamation)
    db.commit()
    db.refresh(reclamation)
    print(f"✅ Réclamation créée (ID: {reclamation.id})")
    
    # 3. Cas historiques (base de connaissance)
    cas1 = BaseConnaissance(
        categorie="bagage_endommage",
        num_vol="BJ509",
        type_probleme="Valise endommagée",
        solution="Compensation 300 EUR",
        compensation_validee=300.00
    )
    cas2 = BaseConnaissance(
        categorie="bagage_endommage",
        num_vol="BJ712",
        type_probleme="Bagage cassé",
        solution="Compensation 250 EUR",
        compensation_validee=250.00
    )
    db.add_all([cas1, cas2])
    db.commit()
    print(f"✅ 2 cas historiques créés")
    
    # 4. DecisionIA (analyse)
    decision = DecisionIA(
        reclamation_id=reclamation.id,
        categorie_detectee="bagage_endommage",
        priorite="ELEVEE",
        resume_auto="Bagage endommagé. Compensation applicable.",
        reponse_generee="Nous sommes désolés...",
        compensation_estimee=300.00,
        score_confiance=0.91
    )
    db.add(decision)
    db.commit()
    db.refresh(decision)
    print(f"✅ Décision IA créée (ID: {decision.id})")
    
    # 5. Logs RAG (quels cas ont été utilisés)
    util1 = UtilisationConnaissance(
        decision_ia_id=decision.id,
        base_connaissance_id=cas1.id,
        score_similarite=0.92,  # ChromaDB similarity
        pertinence=0.95  # Évaluation humaine
    )
    util2 = UtilisationConnaissance(
        decision_ia_id=decision.id,
        base_connaissance_id=cas2.id,
        score_similarite=0.87,
        pertinence=0.88
    )
    db.add_all([util1, util2])
    db.commit()
    
    print(f"✅ 2 utilisations RAG enregistrées")
    
    # 6. Afficher le workflow
    print(f"\n🤖 Workflow RAG pour la décision #{decision.id} :")
    for util in decision.utilisations_connaissance:
        cas = util.base_connaissance
        print(f"\n   Cas historique #{cas.id} :")
        print(f"      Catégorie   : {cas.categorie}")
        print(f"      Problème    : {cas.type_probleme}")
        print(f"      Solution    : {cas.solution}")
        print(f"      Similarité  : {util.score_similarite}")
        print(f"      Pertinence  : {util.pertinence}")
    
    print(f"\n📊 Total utilisations RAG : {db.query(UtilisationConnaissance).count()}")
    
except Exception as e:
    print(f"❌ Erreur : {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

print("=" * 60)