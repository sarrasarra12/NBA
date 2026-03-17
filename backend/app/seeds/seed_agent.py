# app/seeds/seed_agents.py
# Ce fichier crée les 4 comptes agents en BDD au démarrage
# 1 Admin + 3 Agents (un par département)

from app.core.database import SessionLocal
# SessionLocal → session BDD manuelle

from app.models.agent_humain import AgentHumain, RoleAgent
# AgentHumain → le model BDD
# RoleAgent   → enum ADMIN / AGENT

from app.models.departement import Departement, NomDepartement
# Departement    → pour récupérer l'id du département
# NomDepartement → enum BAGAGE, CALL_CENTRE, SERVICE_CLIENT

from app.core.security import hash_password
# hash_password() → hasher le mot de passe avant de le stocker
# JAMAIS stocker en clair !


def seed_agents():

    db = SessionLocal()
    # ouvrir la session manuellement

    try:
        existing = db.query(AgentHumain).count()
        # SELECT COUNT(*) FROM agents_humains
        # si déjà des agents → ne rien faire

        if existing > 0:
            print("✅ Agents déjà créés")
            return

        # ── Récupérer les ids des départements ─────────────
        dept_bagage = db.query(Departement).filter(
            Departement.nom == NomDepartement.BAGAGE
        ).first()
        # SELECT * FROM departements WHERE nom = 'BAGAGE'
        # retourne l'objet Departement complet

        dept_call = db.query(Departement).filter(
            Departement.nom == NomDepartement.CALL_CENTRE
        ).first()
        # département call centre

        dept_service = db.query(Departement).filter(
            Departement.nom == NomDepartement.SERVICE_CLIENT
        ).first()
        # département service client

        if not all([dept_bagage, dept_call, dept_service]):
            print("❌ Départements pas encore créés !")
            print("   Lance seed_departements() d'abord")
            return
        # vérifier que les 3 départements existent
        # seed_departements() doit être appelé AVANT seed_agents()

        # ── Créer les 4 comptes ────────────────────────────
        agents = [

            # 1️⃣ Admin → voit tout, pas de département
            AgentHumain(
                nom            = "Admin",
                prenom         = "Nouvelair",
                email          = "admin@nouvelair.com",
                mot_de_passe   = hash_password("admin123"),
                # hash_password() → "$2b$12$xxx..." jamais en clair
                role           = RoleAgent.ADMIN,
                # ADMIN → accès total
                departement_id = None,
                # None → pas de département spécifique
                is_active      = True
            ),

            # 2️⃣ Agent Bagage
            AgentHumain(
                nom            = "Agent",
                prenom         = "Bagage",
                email          = "agent.bagage@nouvelair.com",
                mot_de_passe   = hash_password("bagage123"),
                role           = RoleAgent.AGENT,
                departement_id = dept_bagage.id,
                # lier à l'id du département BAGAGE
                is_active      = True
            ),

            # 3️⃣ Agent Call Centre
            AgentHumain(
                nom            = "Agent",
                prenom         = "CallCentre",
                email          = "agent.callcentre@nouvelair.com",
                mot_de_passe   = hash_password("callcentre123"),
                role           = RoleAgent.AGENT,
                departement_id = dept_call.id,
                # lier à l'id du département CALL_CENTRE
                is_active      = True
            ),

            # 4️⃣ Agent Service Client
            AgentHumain(
                nom            = "Agent",
                prenom         = "ServiceClient",
                email          = "agent.serviceclient@nouvelair.com",
                mot_de_passe   = hash_password("serviceclient123"),
                role           = RoleAgent.AGENT,
                departement_id = dept_service.id,
                # lier à l'id du département SERVICE_CLIENT
                is_active      = True
            ),
        ]

        db.add_all(agents)
        # ajouter les 4 en une seule fois

        db.commit()
        # sauvegarder en BDD

        print("✅ 4 comptes créés !")
        print("   → admin@nouvelair.com          / admin123")
        print("   → agent.bagage@nouvelair.com   / bagage123")
        print("   → agent.callcentre@nouvelair.com / callcentre123")
        print("   → agent.serviceclient@nouvelair.com / serviceclient123")

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur seed agents : {e}")

    finally:
        db.close()
        # toujours fermer la session