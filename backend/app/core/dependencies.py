# app/core/dependencies.py

from fastapi import Depends, HTTPException, status
#depends : injecter les dépendances 
#HTTPException : retourner les errures HTTp
#statu : code 401,403
from fastapi.security import OAuth2PasswordBearer
#OAuth2PasswordBearer : authentification par token
from sqlalchemy.orm import Session
#Session → type de la session BDD
from app.core.database import get_db
# get_db → session BDD injectée automatiquement
from app.core.security import decode_token
# decode_token → decodage du token
from app.models.agent_humain import AgentHumain, RoleAgent

# Extrait le token du header Authorization automatiquement
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── GARDIEN PRINCIPAL ──────────────────────────────────────
def get_current_agent(
    token: str = Depends(oauth2_scheme),  # token extrait du header
    db: Session = Depends(get_db)         # session BDD
):
    # 1. Token valide ?
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")

    # 2. Agent existe en BDD ?
    agent = db.query(AgentHumain).filter(
        AgentHumain.id == payload.get("id")
    ).first()
    if not agent:
        raise HTTPException(status_code=401, detail="Agent introuvable")

    # 3. Compte actif ?
    if not agent.is_active:
        raise HTTPException(status_code=401, detail="Compte désactivé")

    return agent  # ✅ agent connecté disponible dans la route


# ── ADMIN SEULEMENT ────────────────────────────────────────
def admin_only(agent: AgentHumain = Depends(get_current_agent)):
    if agent.role != RoleAgent.ADMIN:
        raise HTTPException(status_code=403, detail="Admin seulement")
    return agent


# ── AGENT SEULEMENT ────────────────────────────────────────
def agent_only(agent: AgentHumain = Depends(get_current_agent)):
    if agent.role != RoleAgent.AGENT:
        raise HTTPException(status_code=403, detail="Agent seulement")
    return agent


## Résumé visuelsimple
#Requête arrive

#get_current_agent()
 #  → token OK ?     NON → 401
 #  → agent existe ? NON → 401
  #  → actif ?        NON → 401
 #   → OUI ✅ → agent disponible

#admin_only()  → role == ADMIN ? NON → 403
#agent_only()  → role == AGENT ? NON → 403