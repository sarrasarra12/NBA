from app.models.category import Category
from app.models.departement import Departement
from app.core.database import SessionLocal

def seed_categories_and_departements():
    db = SessionLocal()
    try:
        if db.query(Category).count() > 0:
            print("✅ Categories deja creees")
            return

        # ── Créer les 6 catégories ──────────────
        cats = {}
        for nom, desc in [
            ("BAGAGE",           "Problèmes bagages"),
            ("RETARD_VOL",       "Retards de vols"),
            ("ANNULATION",       "Annulations de vols"),
            ("REMBOURSEMENT",    "Demandes de remboursement"),
            ("SERVICE_AEROPORT", "Service aéroport"),
            ("AUTRE",            "Autres réclamations"),
        ]:
            cat = Category(nom=nom, description=desc)
            db.add(cat)
            db.flush()
            cats[nom] = cat.id

        # ── Créer 3 départements ─────────────────
        # BAGAGE → département BAGAGE
        # RETARD_VOL + ANNULATION + REMBOURSEMENT → SERVICE_CLIENT
        # SERVICE_AEROPORT + AUTRE → CALL_CENTRE
        depts = [
            Departement(nom="BAGAGE",        category_id=cats["BAGAGE"]),
            Departement(nom="SERVICE_CLIENT", category_id=cats["RETARD_VOL"]),
            Departement(nom="CALL_CENTRE",    category_id=cats["SERVICE_AEROPORT"]),
        ]
        db.add_all(depts)
        db.commit()
        print("✅ Categories et departements crees !")

    except Exception as e:
        db.rollback()
        print(f"Erreur seed : {e}")
    finally:
        db.close()
