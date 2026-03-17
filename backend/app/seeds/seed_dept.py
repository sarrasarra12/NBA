# app/seeds/seed_departements.py
# Ce fichier crée les 3 départements en BDD au démarrage
# Si déjà créés → rien ne se passe (idempotent)

from app.core.database import SessionLocal
# SessionLocal → ouvrir une session BDD manuellement
# pas dans une route donc pas de Depends(get_db)

from app.models.departement import Departement, NomDepartement
# Departement   → le model BDD
# NomDepartement → l'enum BAGAGE, CALL_CENTRE, SERVICE_CLIENT


def seed_departements():

    db = SessionLocal()
    # ouvrir la session manuellement

    try:
        existing = db.query(Departement).count()
        # SELECT COUNT(*) FROM departements
        # compter les départements existants

        if existing > 0:
            print("✅ Départements déjà créés")
            return
        # déjà créés → sortir sans rien faire
        # évite les doublons à chaque redémarrage

        departements = [
            Departement(
                nom         = NomDepartement.BAGAGE,
                responsable = "Chef Bagage",
                email       = "bagage@nouvelair.com"
            ),
            # département bagage → gère les réclamations bagages

            Departement(
                nom         = NomDepartement.CALL_CENTRE,
                responsable = "Chef Call Centre",
                email       = "callcentre@nouvelair.com"
            ),
            # département call centre → gère service aéroport + autre

            Departement(
                nom         = NomDepartement.SERVICE_CLIENT,
                responsable = "Chef Service Client",
                email       = "serviceclient@nouvelair.com"
            ),
            # département service client → gère remboursement + retard + annulation
        ]

        db.add_all(departements)
        # ajouter les 3 en une seule fois en mémoire

        db.commit()
        # sauvegarder définitivement en BDD

        print("✅ 3 départements créés !")
        print("   → BAGAGE")
        print("   → CALL_CENTRE")
        print("   → SERVICE_CLIENT")

    except Exception as e:
        db.rollback()
        # annuler si erreur
        print(f"❌ Erreur seed départements : {e}")

    finally:
        db.close()
        # toujours fermer la session
        # finally = exécuté même si erreur