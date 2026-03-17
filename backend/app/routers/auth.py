# app/routers/auth.py
# Ce fichier contient les endpoints d'authentification
# - POST /api/auth/login  → connexion agent
# - GET  /api/auth/me     → profil agent connecté

# ── IMPORTS ────────────────────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException, status
# APIRouter   → créer un groupe de routes
# Depends     → injection de dépendances
# HTTPException → retourner une erreur HTTP
# status      → codes HTTP (200, 401, 404...)

from sqlalchemy.orm import Session
# Session → type de la session BDD

from app.core.database import get_db
# get_db → session BDD injectée automatiquement

from app.core.security import verify_password, create_token
# verify_password → comparer mot de passe saisi avec hash BDD
# create_token    → générer le token JWT après login réussi

from app.models.agent_humain import AgentHumain
# AgentHumain → model BDD pour chercher l'agent
from app.models.departement import Departement
# Departement → pour récupérer le nom du département
from app.schemas.auth import LoginRequest, TokenResponse, AgentMe
# LoginRequest  → schema entrée  { email, password }
# TokenResponse → schema sortie  { token, role, dept, nom }
# AgentMe       → schema profil  { id, nom, email, role, dept }
from app.core.dependencies import get_current_agent

# ── ROUTER ─────────────────────────────────────────────────

router = APIRouter(
    prefix="/api/auth",
    # toutes les routes commencent par /api/auth
    tags=["Authentication"]
    # groupe dans la doc /docs
)


# ── ENDPOINT 1 : LOGIN ─────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
# POST /api/auth/login
# response_model=TokenResponse → FastAPI valide la réponse

async def login(
    request: LoginRequest,
    # request → données envoyées par le client
    # { "email": "...", "password": "..." }
    # validées automatiquement par pydantic

    db: Session = Depends(get_db)
    # db → session BDD injectée automatiquement
):

    # ── ÉTAPE 1 : Chercher l'agent par email ───────────────
    agent = db.query(AgentHumain).filter(
        AgentHumain.email == request.email
    ).first()
    # SELECT * FROM agents_humains WHERE email = ?
    # .first() → retourne le premier résultat ou None

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            # 401 = non autorisé
            detail="Email introuvable"
            # message retourné au client
        )
    # agent pas trouvé → arrêter et retourner 401

    # ── ÉTAPE 2 : Vérifier le mot de passe ────────────────
    if not verify_password(request.password, agent.mot_de_passe):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mot de passe incorrect"
        )
    # verify_password() → compare le mot de passe saisi avec le hash BDD
    # False → mot de passe incorrect → 401

    # ── ÉTAPE 3 : Vérifier que le compte est actif ────────
    if not agent.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Compte désactivé"
        )
    # is_active = False → compte bloqué par l'admin → 401

    # ── ÉTAPE 4 : Récupérer le département ────────────────
    departement_nom = None
    # None par défaut → pour l'ADMIN

    if agent.departement_id:
        dept = db.query(Departement).filter(
            Departement.id == agent.departement_id
        ).first()
        # SELECT * FROM departements WHERE id = ?
        if dept:
            departement_nom = dept.nom.value
            # .value → "BAGAGE" pas NomDepartement.BAGAGE

    # ── ÉTAPE 5 : Générer le token JWT ────────────────────
    token = create_token({
        "id"          : agent.id,
        # id de l'agent en BDD

        "email"       : agent.email,
        # email de l'agent

        "role"        : agent.role.value,
        # "ADMIN" ou "AGENT"
        # .value → string pas enum

        "departement" : departement_nom,
        # "BAGAGE", "CALL_CENTRE", "SERVICE_CLIENT" ou None
    })
    # create_token() → signe et retourne "eyJhbGci..."

    # ── ÉTAPE 6 : Retourner la réponse ────────────────────
    return TokenResponse(
        access_token = token,
        # le token JWT

        token_type   = "bearer",
        # toujours "bearer" pour JWT

        role         = agent.role.value,
        # "ADMIN" ou "AGENT" → frontend affiche bon dashboard

        departement  = departement_nom,
        # département de l'agent ou None si ADMIN

        nom          = f"{agent.prenom} {agent.nom}"
        # "Ahmed Dupont" → affiché dans le dashboard
    )


# ── ENDPOINT 2 : MON PROFIL ────────────────────────────────

@router.get("/me")
async def get_me(
    agent: AgentHumain = Depends(get_current_agent)
):
    return {
        "id"          : agent.id,
        "nom"         : f"{agent.prenom} {agent.nom}",
        "email"       : agent.email,
        "role"        : agent.role.value,
        "departement" : agent.departement_id
    }