# app/routers/agent_ia.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_agent
from app.models.reclamation import Reclamation
from app.models.agent_humain import AgentHumain
from app.services.agent_ia_service import generate_ia_response

router = APIRouter(
    prefix="/api/agent-ia",
    tags=["Agent IA"]
)

@router.post("/analyser/{reclamation_id}")
async def analyser_reclamation(
    reclamation_id : int,
    agent          : AgentHumain = Depends(get_current_agent),
    db             : Session = Depends(get_db)
):
    # 1. Récupérer la réclamation
    rec = db.query(Reclamation).filter(
        Reclamation.id == reclamation_id
    ).first()

    if not rec:
        raise HTTPException(status_code=404, detail="Reclamation introuvable")

    # 2. Nom passager
    passager_nom = ""
    if rec.passager:
        passager_nom = f"{rec.passager.prenom} {rec.passager.nom}"

    # 3. Générer réponse IA
    result = generate_ia_response(
        description  = rec.description,
        category     = rec.category,
        passager_nom = passager_nom,
    )

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])

    return {
        "reclamation_id" : reclamation_id,
        "reponse_ia"     : result["reponse"],
        "rules_used"     : "",          
        "score_confiance": result["score_confiance"]
    }