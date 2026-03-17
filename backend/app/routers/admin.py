# app/routers/admin.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import admin_only
from app.core.security import hash_password
from app.models.agent_humain import AgentHumain, RoleAgent
from app.models.departement import Departement, NomDepartement
from app.schemas.auth import AgentCreate, AgentResponse
from typing import List

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


# ── 1. LISTE TOUS LES AGENTS ───────────────────────────────
@router.get("/agents", response_model=List[AgentResponse])
async def get_agents(
    admin = Depends(admin_only),  # ADMIN seulement
    db: Session = Depends(get_db)
):
    agents = db.query(AgentHumain).all()
    # SELECT * FROM agents_humains
    return agents


# ── 2. CRÉER UN AGENT ──────────────────────────────────────
@router.post("/agents", response_model=AgentResponse)
async def create_agent(
    data: AgentCreate,            # données du nouvel agent
    admin = Depends(admin_only),  # ADMIN seulement
    db: Session = Depends(get_db)
):
    # Vérifier email unique
    existing = db.query(AgentHumain).filter(
        AgentHumain.email == data.email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    # Trouver le département si fourni
    departement_id = None
    if data.departement:
        dept = db.query(Departement).filter(
            Departement.nom == NomDepartement[data.departement]
            # NomDepartement["BAGAGE"] → NomDepartement.BAGAGE
        ).first()
        if not dept:
            raise HTTPException(status_code=404, detail="Département introuvable")
        departement_id = dept.id

    # Créer l'agent
    agent = AgentHumain(
        nom           = data.nom,
        prenom        = data.prenom,
        email         = data.email,
        mot_de_passe  = hash_password(data.password),
        # hasher le mot de passe avant stockage
        role          = RoleAgent.AGENT,
        departement_id= departement_id,
        is_active     = True
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)

    return agent


# ── 3. DÉSACTIVER UN AGENT ─────────────────────────────────
@router.put("/agents/{agent_id}/desactiver")
async def desactiver_agent(
    agent_id: int,                # id dans l'URL
    admin = Depends(admin_only),  # ADMIN seulement
    db: Session = Depends(get_db)
):
    agent = db.query(AgentHumain).filter(
        AgentHumain.id == agent_id
    ).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent introuvable")

    agent.is_active = False
    # is_active = False → compte bloqué
    # token encore valide mais dependencies.py rejette → 401
    db.commit()

    return {"message": f"Agent {agent.email} désactivé"}


# ── 4. SUPPRIMER UN AGENT ──────────────────────────────────
@router.delete("/agents/{agent_id}")
async def supprimer_agent(
    agent_id: int,
    admin = Depends(admin_only),  # ADMIN seulement
    db: Session = Depends(get_db)
):
    agent = db.query(AgentHumain).filter(
        AgentHumain.id == agent_id
    ).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent introuvable")

    db.delete(agent)
    db.commit()

    return {"message": f"Agent {agent.email} supprimé"}