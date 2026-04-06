# app/services/routing_service.py
from app.models.category import Category
from app.models.agent_humain import AgentHumain, RoleAgent

def get_agent_by_category(db, category: str):

    # 1. Chercher catégorie → elle connaît son département !
    cat = db.query(Category).filter(
        Category.nom == category.upper()
    ).first()

    if not cat or not cat.departement_id:
        print(f"⚠️ Catégorie {category} sans département → fallback")
        # Fallback → premier département avec agents
        from app.models.departement import Departement
        dept = db.query(Departement).join(AgentHumain).filter(
            AgentHumain.is_active == True,
            AgentHumain.role      == RoleAgent.AGENT
        ).first()
    else:
        dept = cat.departement

    if not dept:
        print(f"❌ Aucun département disponible !")
        return None

    # 2. Chercher agent dans ce département
    agent = db.query(AgentHumain).filter(
        AgentHumain.departement_id == dept.id,
        AgentHumain.role           == RoleAgent.AGENT,
        AgentHumain.is_active      == True
    ).first()

    if not agent:
        print(f"⚠️ Aucun agent dans {dept.nom}")
        return None

    print(f"✅ {category} → {agent.email} ({dept.nom})")
    return agent