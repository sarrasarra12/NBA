from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_agent
from app.models.agent_humain import AgentHumain, RoleAgent
from app.models.reclamation import Reclamation, StatutReclamation
from app.services.email_service import send_reponse_email
from app.models.reponse_ia import ReponseIA
from app.models.reponse_humaine import ReponseHumaine
import os
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/agent",
    tags=["Agent"]
)
class ReponseRequest(BaseModel):
    reponse     : str
    type_reponse: str  # "humaine" ou "ia"


@router.get("/reclamations")
async def get_reclamations(
    agent: AgentHumain = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
    if agent.role == RoleAgent.ADMIN:
        reclamations = db.query(Reclamation).all()
    else:
        reclamations = db.query(Reclamation).filter(
            Reclamation.agent_id == agent.id
        ).all()

    return [
        {
            "id"          : rec.id,
            "category"    : rec.category,
            "statut"      : rec.statut.value,
            "priorite"    : rec.priorite.value,
            "description" : rec.description,
            "created_at"  : rec.created_at.isoformat(),
            "passager": {
                "nom"      : rec.passager.nom,
                "prenom"   : rec.passager.prenom,
                "email"    : rec.passager.email,
                "telephone": rec.passager.telephone,
            } if rec.passager else None,
            "carte": {
                "vol"              : rec.carte_embarquement.vol,
                "departure_airport": rec.carte_embarquement.departure_airport,
                "arrival_airport"  : rec.carte_embarquement.destination_airport,
                "departure_date"   : rec.carte_embarquement.departure_date,
                "file_url"         : rec.carte_embarquement.file_url,
            } if rec.carte_embarquement else None,
            "pieces_jointes": [
                {
                    "nom_fichier": pj.nom_fichier,
                    "type"       : pj.type_fichier,
                    "url"        : pj.url_stockage,
                }
                for pj in rec.pieces_jointes
            ] if rec.pieces_jointes else [],
        }
        for rec in reclamations
    ]


# ── Détail réclamation ─────────────────────────────
@router.get("/reclamations/{id}")   # ← reclamations pas reclamation !
async def get_reclamation(
    id    : int,
    agent : AgentHumain = Depends(get_current_agent),
    db    : Session = Depends(get_db)
):
    rec = db.query(Reclamation).filter(
        Reclamation.id == id   # ← == pas = !
    ).first()

    if not rec:
        raise HTTPException(status_code=404, detail="Introuvable")

    return {
        "id"         : rec.id,
        "category"   : rec.category,
        "statut"     : rec.statut.value,   # ← statut pas status !
        "priorite"   : rec.priorite.value,
        "description": rec.description,
        "created_at" : rec.created_at.isoformat(),
        "passager": {
            "nom"      : rec.passager.nom,
            "prenom"   : rec.passager.prenom,
            "email"    : rec.passager.email,
            "telephone": rec.passager.telephone,
        } if rec.passager else None,        # ← None obligatoire !
        "carte": {
            "vol"              : rec.carte_embarquement.vol,
            "departure_airport": rec.carte_embarquement.departure_airport,
            "arrival_airport"  : rec.carte_embarquement.destination_airport,
            "departure_date"   : rec.carte_embarquement.departure_date,
        } if rec.carte_embarquement else None,  # ← None obligatoire !
        "pieces_jointes": [
            {
                "nom_fichier": pj.nom_fichier,
                "url"        : pj.url_stockage
            }
            for pj in rec.pieces_jointes
        ] if rec.pieces_jointes else []
    }


# ── Changer statut ─────────────────────────────────
@router.put("/reclamations/{id}/statut")
async def changer_statut(
    id     : int,
    statut : str,
    agent  : AgentHumain = Depends(get_current_agent),
    db     : Session = Depends(get_db)
):
    rec = db.query(Reclamation).filter(
        Reclamation.id == id
    ).first()

    if not rec:
        raise HTTPException(status_code=404, detail="Introuvable")

    rec.statut = StatutReclamation[statut]
    db.commit()

    return {"message": f"Statut change vers {statut}"}

# ── Répondre à une réclamation ─────────────────────
@router.post("/reclamations/{id}/repondre")
async def repondre_reclamation(
    id    : int,
    data  : ReponseRequest,
    agent : AgentHumain = Depends(get_current_agent),
    db    : Session = Depends(get_db)
):
    # 1. Vérifier réclamation existe
    rec = db.query(Reclamation).filter(
        Reclamation.id == id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Réclamation introuvable")

    # 2. Créer réponse selon type
    if data.type_reponse == "humaine":
        reponse = ReponseHumaine(
            reclamation_id = id,
            contenu        = data.reponse,
            agent_id       = agent.id
        )
    else:
        reponse = ReponseIA(
            reclamation_id  = id,
            contenu         = data.reponse,
            score_confiance = 0.85
        )

    db.add(reponse)

    # 3. Clôturer réclamation
    rec.statut = StatutReclamation.CLOTURED
    db.commit()

    # 4. Envoyer email au passager
    passager = rec.passager
    if passager and passager.email:

        # Infos vol
        flight = rec.carte_embarquement.vol if rec.carte_embarquement else "N/A"

        # Département de l'agent
        dept_nom = agent.departement.nom if agent.departement else "SERVICE_CLIENT"

        # Logo URL depuis MinIO
        logo_url = os.getenv("LOGO_URL", "http://localhost:9000/claims-files/logo.png")

        # URL suivi
        tracking_url = f"http://localhost:5173/suivi?token={rec.public_token}"

        await send_reponse_email(
            to              = passager.email,
            passenger_name  = f"{passager.prenom} {passager.nom}",
            reclamation_id  = rec.id,
            category        = rec.category,
            flight_number   = flight,
            reponse_contenu = data.reponse,
            departement     = dept_nom,
            tracking_url    = tracking_url,
            logo_url        = logo_url,
        )

    return {"message": "Réponse envoyée avec succès !"}