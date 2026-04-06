from app.models.category import Category
from app.models.departement import Departement
from app.core.database import SessionLocal

def seed_categories_and_departements():
    db = SessionLocal()
    try:
        if db.query(Category).count() > 0:
            print("✅ Categories deja creees")
            return

        # Créer départements d'abord
        dept_bagage  = Departement(nom="BAGAGE")
        dept_service = Departement(nom="SERVICE_CLIENT")
        dept_call    = Departement(nom="CALL_CENTRE")
        db.add_all([dept_bagage, dept_service, dept_call])
        db.flush()

        # Créer catégories liées aux départements
        categories = [
            Category(nom="BAGAGE",           description="Problèmes bagages",       departement_id=dept_bagage.id),
            Category(nom="RETARD_VOL",        description="Retards de vols",         departement_id=dept_service.id),
            Category(nom="ANNULATION",        description="Annulations de vols",     departement_id=dept_service.id),
            Category(nom="REMBOURSEMENT",     description="Demandes remboursement",  departement_id=dept_service.id),
            Category(nom="SERVICE_AEROPORT",  description="Service aéroport",        departement_id=dept_call.id),
            Category(nom="AUTRE",             description="Autres réclamations",     departement_id=dept_call.id),
        ]
        db.add_all(categories)
        db.commit()
        print("✅ Categories et departements crees !")

    except Exception as e:
        db.rollback()
        print(f"Erreur seed : {e}")
    finally:
        db.close()


## Résultat

#BAGAGE           → département BAGAGE ✅
#RETARD_VOL       → département SERVICE_CLIENT ✅
#ANNULATION       → département SERVICE_CLIENT ✅
#REMBOURSEMENT    → département SERVICE_CLIENT ✅
#SERVICE_AEROPORT → département CALL_CENTRE ✅
#AUTRE            → département CALL_CENTRE ✅

#Nouvelle catégorie OVERBOOKING :
#→ admin crée catégorie OVERBOOKING
#→ choisit département SERVICE_CLIENT
#→ routing trouve automatiquement ! ✅