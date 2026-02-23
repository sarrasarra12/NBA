# test_reclamation.py

"""
Test : Créer une réclamation complète
Vérifie que les models Passager et Reclamation fonctionnent
"""

from app.core.database import SessionLocal
from app.models.passager import Passager
from app.models.reclamation import Reclamation, StatutReclamation, Priorite
from app.models.agent_humain import AgentHumain
import secrets

print("🧪 Test création Réclamation complète...")
print("=" * 60)

# Créer session
db = SessionLocal()

try:
    # ────────────────────────────────────────────────────
    # 1. CRÉER UN PASSAGER
    # ────────────────────────────────────────────────────
    
    passager = Passager(
        nom="Ben Ali",
        prenom="Ahmed",
        email="ahmed.benali@gmail.com",
        telephone="+216 12 345 678"
    )
    db.add(passager)
    db.commit()
    db.refresh(passager)
    
    print(f"✅ Passager créé :")
    print(f"   ID       : {passager.id}")
    print(f"   Nom      : {passager.nom} {passager.prenom}")
    print(f"   Email    : {passager.email}")
    print(f"   Téléphone: {passager.telephone}")
    
    
    # ────────────────────────────────────────────────────
    # 2. CRÉER UNE RÉCLAMATION
    # ────────────────────────────────────────────────────
    
    # Générer un token unique pour le suivi
    token = secrets.token_hex(16)  # 32 caractères
    
    reclamation = Reclamation(
        public_token=token,
        passager_id=passager.id,
        description=(
            "Bonjour, j'ai voyagé le 18 février sur le vol BJ509 "
            "de Paris CDG à Djerba. À mon arrivée, ma valise était "
            "gravement endommagée avec une grande déchirure sur le côté. "
            "Je joins des photos. Merci de traiter ma réclamation."
        ),
        langue="fr"
    )
    db.add(reclamation)
    db.commit()
    db.refresh(reclamation)
    
    print(f"\n✅ Réclamation créée :")
    print(f"   ID          : {reclamation.id}")
    print(f"   Token       : {reclamation.public_token}")
    print(f"   Statut      : {reclamation.statut.value}")
    print(f"   Priorité    : {reclamation.priorite.value}")
    print(f"   Langue      : {reclamation.langue}")
    print(f"   Date créa.  : {reclamation.created_at}")
    
    
    # ────────────────────────────────────────────────────
    # 3. TESTER LES RELATIONS
    # ────────────────────────────────────────────────────
    
    print(f"\n🔗 Test des relations :")
    print(f"   Passager de la réclamation :")
    print(f"      Nom   : {reclamation.passager.nom} {reclamation.passager.prenom}")
    print(f"      Email : {reclamation.passager.email}")
    
    print(f"\n   Réclamations du passager : {len(passager.reclamations)}")
    for rec in passager.reclamations:
        print(f"      - Réclamation #{rec.id} ({rec.statut.value})")
    
    
    # ────────────────────────────────────────────────────
    # 4. STATISTIQUES
    # ────────────────────────────────────────────────────
    
    total_passagers = db.query(Passager).count()
    total_reclamations = db.query(Reclamation).count()
    
    print(f"\n📊 Statistiques base de données :")
    print(f"   Total passagers     : {total_passagers}")
    print(f"   Total réclamations  : {total_reclamations}")
    
    print(f"\n💡 Va dans pgAdmin et rafraîchis les tables !")
    print(f"   Tu verras les nouvelles données")
    
except Exception as e:
    print(f"\n❌ Erreur : {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
    
finally:
    db.close()

print("=" * 60)