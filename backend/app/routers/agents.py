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
from datetime import datetime 
from app.services.email_service import send_email 
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
    statut : str = None,
    agent: AgentHumain = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
     # Requête de base
    query = db.query(Reclamation)

    # Filtre par agent si pas ADMIN
    if agent.role != RoleAgent.ADMIN:
        query = query.filter(Reclamation.agent_id == agent.id)

    # Filtre par statut si fourni
    # Ex: ?statut=NOUVELLE ou ?statut=CLOTURED
    if statut:
        query = query.filter(
            Reclamation.statut == StatutReclamation[statut]
        )

    reclamations = query.all()

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
    # ── 1. Vérifier que la réclamation existe ──────
    rec = db.query(Reclamation).filter(
        Reclamation.id == id
    ).first()

    if not rec:
        raise HTTPException(status_code=404, detail="Introuvable")

    # ── 2. Sauvegarder l'ancien statut ────────────
    # Utile pour retourner dans la réponse API
    # Ex: "NOUVELLE" → "EN_ANALYSE"
    ancien_statut = rec.statut.value

    # ── 3. Changer le statut ──────────────────────
    rec.statut = StatutReclamation[statut]

    # ── 4. Si clôturée → enregistrer la date ──────
    # closed_at permet de :
    #   - afficher la date dans l'historique
    #   - calculer la durée de traitement
    #   - trier l'historique par date de clôture
    if statut == "CLOTURED":
        rec.closed_at = datetime.utcnow()

    # ── 5. Sauvegarder en base de données ─────────
    db.commit()

    # ── 6. Envoyer email au passager ──────────────
    # Le passager est notifié automatiquement
    # à chaque changement de statut
    try:
        passager = rec.passager
        if passager and passager.email:

            # Labels lisibles pour l'email
            statut_labels = {
                "NOUVELLE"   : "Nouvelle",
                "EN_ANALYSE" : "En cours de traitement",
                "CLOTURED"   : "Cloturee",
            }
            label = statut_labels.get(statut, statut)

            # URL de suivi pour le passager
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
            tracking_url = f"{frontend_url}/suivi?token={rec.public_token}"

            # Template HTML de l'email
            html = f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                <div style="background:#1a5276;padding:20px;text-align:center;">
                    <h1 style="color:white;margin:0;">NouvelAir</h1>
                </div>
                <div style="padding:30px;background:#f8f9fa;">
                    <h2>Mise a jour de votre reclamation</h2>
                    <p>Bonjour <strong>{passager.prenom} {passager.nom}</strong>,</p>
                    <p>Votre reclamation <strong>#{rec.id}</strong>
                       a ete mise a jour :</p>
                    <div style="background:#fff;
                                border-left:4px solid #1a5276;
                                padding:15px;margin:20px 0;
                                border-radius:4px;">
                        <strong>Nouveau statut : {label}</strong>
                    </div>
                    <a href="{tracking_url}"
                       style="background:#1a5276;color:white;
                              padding:12px 25px;text-decoration:none;
                              border-radius:5px;display:inline-block;">
                        Suivre ma reclamation
                    </a>
                </div>
                <div style="padding:15px;text-align:center;
                            color:#888;font-size:12px;">
                    NouvelAir - Service Client
                </div>
            </div>
            """

            # Envoi de l'email
            await send_email(
                to      = passager.email,
                subject = f"Mise a jour reclamation #{rec.id} - {label}",
                body    = html
            )
            print(f"Email statut envoye a {passager.email}")

    except Exception as e:
        # L'email échoue → on ne bloque pas le changement de statut
        print(f"Erreur email statut : {e}")

    # ── 7. Retourner ancien + nouveau statut ──────
    # Le frontend peut afficher :
    # "Statut changé : NOUVELLE → CLOTURED"
    return {
        "message"       : f"Statut change vers {statut}",
        "ancien_statut" : ancien_statut,   # ← ex: "NOUVELLE"
        "nouveau_statut": statut           # ← ex: "CLOTURED"
    }


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

# Historique des réclamations 
@router.get("/historique")
async def get_historique(
    agent : AgentHumain = Depends(get_current_agent),
    db    : Session = Depends(get_db)
):
    """
    Retourne toutes les réclamations clôturées.
    - ADMIN  → voit toutes les réclamations clôturées
    - AGENT  → voit seulement ses réclamations clôturées
    Triées par date de clôture (plus récente en premier)
    """

    # ── 1. Filtrer par statut CLOTURED ────────────
    query = db.query(Reclamation).filter(
        Reclamation.statut == StatutReclamation.CLOTURED
    )

    # ── 2. Filtrer par agent si pas ADMIN ─────────
    # ADMIN voit tout → pas de filtre supplémentaire
    # AGENT voit seulement ses réclamations
    if agent.role != RoleAgent.ADMIN:
        query = query.filter(
            Reclamation.agent_id == agent.id
        )

    # ── 3. Trier par date de clôture ──────────────
    # La plus récente en premier
    historique = query.order_by(
        Reclamation.closed_at.desc()
    ).all()

    # ── 4. Retourner les données formatées ─────────
    return {
        # Nombre total de réclamations clôturées
        "count": len(historique),

        # Liste des réclamations
        "historique": [
            {
                "id"         : r.id,
                "category"   : r.category,

                # Tronqué à 100 caractères pour la liste
                # Le détail complet est dans GET /reclamations/{id}
                "description": r.description[:100],

                "priorite"   : r.priorite.value,

                # Date de création de la réclamation
                "created_at" : r.created_at.isoformat(),

                # Date de clôture → permet de calculer
                # la durée de traitement
                "closed_at"  : r.closed_at.isoformat() if r.closed_at else None,

                # Nom du passager
                "passager"   : f"{r.passager.prenom} {r.passager.nom}"
                               if r.passager else "N/A",

                # Dernière réponse envoyée :
                # 1. Cherche d'abord une réponse humaine
                # 2. Sinon cherche une réponse IA
                # 3. Sinon None
                "reponse"    : (
                    r.reponses_humaines[-1].contenu
                    if r.reponses_humaines
                    else (
                        r.reponses_ia[-1].contenu
                        if r.reponses_ia
                        else None
                    )
                ),
            }
            for r in historique
        ]
    }
