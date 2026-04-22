# app/routers/messages.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_agent
from app.models.message import Message
from app.models.agent_humain import AgentHumain

router = APIRouter(
    prefix="/api/messages",
    tags=["Messages"]
)

class MessageRequest(BaseModel):
    destinataire_id : int
    contenu         : str

# ══════════════════════════════════════════
# POST /api/messages — Envoyer
# ══════════════════════════════════════════
@router.post("")
async def envoyer_message(
    data  : MessageRequest,
    agent : AgentHumain = Depends(get_current_agent),
    db    : Session = Depends(get_db)
):
    destinataire = db.query(AgentHumain).filter(
        AgentHumain.id == data.destinataire_id
    ).first()

    if not destinataire:
        raise HTTPException(
            status_code = 404,
            detail      = "Destinataire introuvable"
        )

    if data.destinataire_id == agent.id:
        raise HTTPException(
            status_code = 400,
            detail      = "Vous ne pouvez pas vous envoyer un message"
        )

    message = Message(
        expediteur_id   = agent.id,        # ← expediteur_id pas agent_id
        destinataire_id = data.destinataire_id,
        contenu         = data.contenu
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    return {
        "success": True,
        "message": "Message envoyé avec succès !",
        "id"     : message.id
    }

# ══════════════════════════════════════════
# GET /api/messages/inbox — Réception
# ══════════════════════════════════════════
@router.get("/inbox")
async def get_inbox(
    agent : AgentHumain = Depends(get_current_agent),
    db    : Session = Depends(get_db)
):
    messages = db.query(Message).filter(
        Message.destinataire_id == agent.id  # ← destinataire_id pas destinatatire_id
    ).order_by(Message.created_at.desc()).all()

    return [
        {
            "id"        : m.id,
            "contenu"   : m.contenu,
            "lu"        : m.lu,
            "created_at": m.created_at.isoformat(),
            "expediteur": {
                "id"    : m.expediteur.id,
                "nom"   : m.expediteur.nom,
                "prenom": m.expediteur.prenom,
                "role"  : m.expediteur.role.value
            }
        }
        for m in messages
    ]

# ══════════════════════════════════════════
# GET /api/messages/non-lus — Badge
# ══════════════════════════════════════════
@router.get("/non-lus")
async def get_non_lus(
    agent : AgentHumain = Depends(get_current_agent),
    db    : Session = Depends(get_db)
):
    count = db.query(Message).filter(
        Message.destinataire_id == agent.id,  # ← destinataire_id pas destiantaire_id
        Message.lu == False
    ).count()

    return { "count": count }

# ══════════════════════════════════════════
# PUT /api/messages/{id}/lu — Marquer lu
# ══════════════════════════════════════════
@router.put("/{id}/lu")
async def marquer_lu(
    id    : int,
    agent : AgentHumain = Depends(get_current_agent),
    db    : Session = Depends(get_db)
):
    message = db.query(Message).filter(
        Message.id              == id,
        Message.destinataire_id == agent.id
    ).first()

    if not message:
        raise HTTPException(
            status_code = 404,
            detail      = "Message introuvable"
        )

    message.lu = True
    db.commit()

    return { "success": True }

# ══════════════════════════════════════════
# GET /api/messages/agents — Liste agents
# ══════════════════════════════════════════
@router.get("/agents")
async def get_agents(
    agent : AgentHumain = Depends(get_current_agent),
    db    : Session = Depends(get_db)
):
    agents = db.query(AgentHumain).filter(
        AgentHumain.id        != agent.id,
        AgentHumain.is_active == True
    ).all()

    return [
        {
            "id"    : a.id,
            "nom"   : a.nom,
            "prenom": a.prenom,
            "role"  : a.role.value
        }
        for a in agents
    ]