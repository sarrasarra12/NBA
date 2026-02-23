# test_notification.py

from app.core.database import SessionLocal
from app.models import Passager, Reclamation, DecisionIA, Notification
import secrets

print("🧪 Test Notification avec DecisionIA...")
print("=" * 60)

db = SessionLocal()

try:
    # 1. Passager
    passager = Passager(
        nom="Bouzid",
        prenom="Salma",
        email="salma@gmail.com",
        telephone="+216 29 456 123"
    )
    db.add(passager)
    db.commit()
    db.refresh(passager)
    print(f"✅ Passager créé (ID: {passager.id})")
    
    # 2. Réclamation
    reclamation = Reclamation(
        public_token=secrets.token_hex(16),
        passager_id=passager.id,
        description="Vol retardé de 5 heures",
        langue="fr"
    )
    db.add(reclamation)
    db.commit()
    db.refresh(reclamation)
    print(f"✅ Réclamation créée (ID: {reclamation.id})")
    
    # 3. DecisionIA
    decision = DecisionIA(
        reclamation_id=reclamation.id,
        categorie_detectee="retard_vol",
        priorite="MOYENNE",
        resume_auto="Vol retardé de 5 heures. Compensation applicable.",
        reponse_generee="Cher(e) client(e), nous sommes désolés pour le retard...",
        compensation_estimee=200.00,
        score_confiance=0.92
    )
    db.add(decision)
    db.commit()
    db.refresh(decision)
    print(f"✅ Décision IA créée (ID: {decision.id})")
    
    # 4. Notifications liées à DecisionIA
    notif1 = Notification(
        reclamation_id=reclamation.id,
        decision_ia_id=decision.id,  # ← Lien vers DecisionIA
        contenu="Votre réclamation a été reçue. Token: " + reclamation.public_token[:8]
    )
    notif2 = Notification(
        reclamation_id=reclamation.id,
        decision_ia_id=decision.id,  # ← Lien vers DecisionIA
        contenu=decision.reponse_generee  # ← Contenu vient de l'IA
    )
    notif3 = Notification(
        reclamation_id=reclamation.id,
        decision_ia_id=decision.id,  # ← Lien vers DecisionIA
        contenu=f"Compensation approuvée : {decision.compensation_estimee} EUR"
    )
    
    db.add_all([notif1, notif2, notif3])
    db.commit()
    
    print(f"✅ 3 notifications créées")
    
    # 5. Afficher
    print(f"\n📧 Notifications de la réclamation #{reclamation.id} :")
    for i, notif in enumerate(reclamation.notifications, 1):
        print(f"   {i}. {notif.contenu[:60]}...")
    
    print(f"\n🤖 Notifications générées par l'IA :")
    for i, notif in enumerate(decision.notifications, 1):
        print(f"   {i}. ID Notification: {notif.id}")
    
    print(f"\n📊 Total notifications : {db.query(Notification).count()}")
    
except Exception as e:
    print(f"❌ Erreur : {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

print("=" * 60)