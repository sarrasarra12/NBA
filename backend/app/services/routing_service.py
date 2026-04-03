from app.models.departement import Departement
from app.models.category import Category
from app.models.agent_humain import AgentHumain, RoleAgent

# routing_service.py
def get_agent_by_category(db, category: str):
    cat = db.query(Category).filter(
        Category.nom == category.upper()
    ).first()

    if not cat or not cat.departement:
        # Fallback → CALL_CENTRE
        dept = db.query(Departement).filter(
            Departement.nom == "CALL_CENTRE"
        ).first()
    else:
        dept = cat.departement

    if not dept:
        return None

    agent = db.query(AgentHumain).filter(
        AgentHumain.departement_id == dept.id,
        AgentHumain.role           == RoleAgent.AGENT,
        AgentHumain.is_active      == True
    ).first()

    return agent
