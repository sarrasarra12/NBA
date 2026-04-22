# app/routers/admin.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import admin_only
from app.core.security import hash_password
from app.models.agent_humain import AgentHumain, RoleAgent
from app.models.departement import Departement
from app.models.category import Category
from app.models.reclamation import Reclamation, Priorite
from app.schemas.auth import AgentCreate, AgentResponse
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.models.reponse_ia      import ReponseIA
from app.models.reponse_humaine import ReponseHumaine
from app.models.feedback        import Feedback

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)

# ══════════════════════════════════════════
# SCHEMAS
# ══════════════════════════════════════════

class CategoryCreate(BaseModel):
    nom        : str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id         : int
    nom        : str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class DepartementCreate(BaseModel):
    nom        : str
    responsable: Optional[str] = None
    email      : Optional[str] = None
    category_id: Optional[int] = None

class DepartementResponse(BaseModel):
    id         : int
    nom        : str
    responsable: Optional[str] = None
    email      : Optional[str] = None
    class Config:
        from_attributes = True


# ══════════════════════════════════════════
# CRUD AGENTS
# ══════════════════════════════════════════

@router.get("/agents", response_model=List[AgentResponse])
async def get_agents(
    admin = Depends(admin_only),
    db: Session = Depends(get_db)
):
    return db.query(AgentHumain).all()


@router.post("/agents", response_model=AgentResponse)
async def create_agent(
    data: AgentCreate,
    admin = Depends(admin_only),
    db: Session = Depends(get_db)
):
    existing = db.query(AgentHumain).filter(
        AgentHumain.email == data.email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    departement_id = None
    if data.departement:
        dept = db.query(Departement).filter(
            Departement.nom == data.departement
        ).first()
        if not dept:
            raise HTTPException(status_code=404, detail="Département introuvable")
        departement_id = dept.id

    agent = AgentHumain(
        nom            = data.nom,
        prenom         = data.prenom,
        email          = data.email,
        mot_de_passe   = hash_password(data.password),
        role           = RoleAgent.AGENT,
        departement_id = departement_id,
        is_active      = True
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@router.put("/agents/{agent_id}/desactiver")
async def desactiver_agent(
    agent_id: int,
    admin = Depends(admin_only),
    db: Session = Depends(get_db)
):
    agent = db.query(AgentHumain).filter(AgentHumain.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent introuvable")
    agent.is_active = False
    db.commit()
    return {"message": f"Agent {agent.email} désactivé"}


@router.delete("/agents/{agent_id}")
async def supprimer_agent(
    agent_id: int,
    admin = Depends(admin_only),
    db: Session = Depends(get_db)
):
    agent = db.query(AgentHumain).filter(AgentHumain.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent introuvable")
    db.delete(agent)
    db.commit()
    return {"message": f"Agent {agent.email} supprimé"}


# ══════════════════════════════════════════
# CRUD CATEGORIES
# ══════════════════════════════════════════

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    admin = Depends(admin_only),
    db: Session = Depends(get_db)
):
    return db.query(Category).all()


@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    data: CategoryCreate,
    admin = Depends(admin_only),
    db: Session = Depends(get_db)
):
    existing = db.query(Category).filter(Category.nom == data.nom).first()
    if existing:
        raise HTTPException(status_code=400, detail="Catégorie déjà existante")
    category = Category(nom=data.nom, description=data.description)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    admin = Depends(admin_only),
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
    db.delete(category)
    db.commit()
    return {"message": f"Catégorie {category.nom} supprimée"}


# ══════════════════════════════════════════
# CRUD DEPARTEMENTS
# ══════════════════════════════════════════

@router.get("/departements", response_model=List[DepartementResponse])
async def get_departements(
    admin = Depends(admin_only),
    db: Session = Depends(get_db)
):
    return db.query(Departement).all()


@router.post("/departements", response_model=DepartementResponse)
async def create_departement(
    data: DepartementCreate,
    admin = Depends(admin_only),
    db: Session = Depends(get_db)
):
    dept = Departement(
        nom         = data.nom,
        responsable = data.responsable,
        email       = data.email,
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.delete("/departements/{dept_id}")
async def delete_departement(
    dept_id: int,
    admin = Depends(admin_only),
    db: Session = Depends(get_db)
):
    dept = db.query(Departement).filter(Departement.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Département introuvable")
    db.delete(dept)
    db.commit()
    return {"message": f"Département {dept.nom} supprimé"}


# ══════════════════════════════════════════
# STATISTIQUES
# ══════════════════════════════════════════

@router.get("/stats")
async def get_stats(
    periode : str = Query(default="tout", enum=["7j", "30j", "12m", "tout"]),
    admin   = Depends(admin_only),
    db      : Session = Depends(get_db)
):
    now = datetime.utcnow()

    if periode == "7j":
        date_debut = now - timedelta(days=7)
    elif periode == "30j":
        date_debut = now - timedelta(days=30)
    elif periode == "12m":
        date_debut = now - timedelta(days=365)
    else:
        date_debut = None

    query = db.query(Reclamation)
    if date_debut:
        query = query.filter(Reclamation.created_at >= date_debut)

    total = query.count()

    par_categorie = query.with_entities(
        Reclamation.category,
        func.count(Reclamation.id)
    ).group_by(Reclamation.category).all()

    par_priorite = query.with_entities(
        Reclamation.priorite,
        func.count(Reclamation.id)
    ).group_by(Reclamation.priorite).all()

    return {
        "total"        : total,
        "periode"      : periode,
        "par_categorie": {cat: c for cat, c in par_categorie},
        "par_priorite" : {p.value: c for p, c in par_priorite},
    }
#-------------------------
# Stat-ia

#--------------------------
@router.get("/stats/agent-ia")
async def get_stats_agent_ia(
    admin = Depends(admin_only),
    db    : Session = Depends(get_db)
):
    # Compter réponses IA
    total_ia      = db.query(ReponseIA).count()

    # Compter réponses manuelles
    total_humaine = db.query(ReponseHumaine).count()

    # Total général
    total = total_ia + total_humaine

    # Calculer taux
    taux_ia      = round(total_ia / total * 100, 1) if total > 0 else 0
    taux_humaine = round(total_humaine / total * 100, 1) if total > 0 else 0

    # Feedbacks passagers
    feedbacks       = db.query(Feedback).all()
    total_feedbacks = len(feedbacks)
    note_moyenne    = round(
        sum(f.note for f in feedbacks) / total_feedbacks, 2
    ) if total_feedbacks > 0 else 0

    # Distribution notes 1 à 5
    distribution = {
        str(i): sum(1 for f in feedbacks if f.note == i)
        for i in range(1, 6)
    }

    return {
        "carte1": {
            "total_reponses"      : total,
            "total_ia"            : total_ia,
            "total_humaine"       : total_humaine,
            "taux_utilisation_ia" : taux_ia,
            "taux_humaine"        : taux_humaine,
        },
        "carte2": {
            "note_moyenne_globale": note_moyenne,
            "total_feedbacks"     : total_feedbacks,
            "distribution"        : distribution
        }
    }