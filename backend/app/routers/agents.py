from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_agent
from app.models.agent_humain import AgentHumain, RoleAgent
from app.models.reclamation import Reclamation, StatutReclamation

router = APIRouter(
    prefix="/api/agent",
    tags=["Agent"]
)

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