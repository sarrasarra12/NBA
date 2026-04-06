# app/routers/claims.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.reclamation import ReclamationResponse
from app.models import Passager, Reclamation, CarteEmbarquement, PieceJointe
from app.services.file_storage import upload_file
import secrets
from app.models.passager import TypeContact
from typing import List, Optional
from app.services.email_service import send_confirmation_email
from pydantic import BaseModel
import os
import shutil
from app.services.ocr_service import extract_boarding_pass_info
from app.services.pnr_service import verify_pnr
from app.schemas.reclamation import PNRVerifyRequest, FlightSearchRequest
from app.services.routing_service import get_agent_by_category
from app.services.priority_service import calculate_priority
from app.models.category import Category


class PNRVerifyRequest(BaseModel):
    pnr_code: str


router = APIRouter(
    prefix="/api/claims",
    tags=["Claims"]
)


# ══════════════════════════════════════════════════
# POST / → Créer réclamation
# ══════════════════════════════════════════════════
@router.post("/", response_model=ReclamationResponse, status_code=status.HTTP_201_CREATED)
async def create_claim(
    passenger_name    : str                  = Form(...),
    email             : str                  = Form(...),
    telephone         : str                  = Form(...),
    description       : str                  = Form(...),
    flight_number     : str                  = Form(...),
    departure_airport : str                  = Form(...),
    arrival_airport   : str                  = Form(...),
    departure_date    : str                  = Form(...),
    category          : str                  = Form(...),
    pir_reference     : Optional[str]        = Form(None),
    type_contact      : str                  = Form(...),
    pnr_code          : str                  = Form(...),
    boarding_pass     : Optional[UploadFile] = File(None),
    pieces            : List[UploadFile]     = File(default=[]),
    db                : Session              = Depends(get_db)
):
    # ── Vérification PNR ─────────────────────────
    if pnr_code:
        pnr_result = verify_pnr(db, pnr_code)

        if not pnr_result.get("exists"):
            raise HTTPException(
                status_code=422,
                detail={
                    "alert": f"PNR '{pnr_code.upper()}' introuvable. Vérifiez votre billet."
                }
            )

        if pnr_result.get("flight_number", "").upper() != flight_number.upper():
            raise HTTPException(
                status_code=422,
                detail={
                    "alert": f"Le PNR '{pnr_code.upper()}' ne correspond pas au vol {flight_number.upper()}."
                }
            )

    try:
        # ── 1. Séparer nom et prénom ──────────────
        parts = passenger_name.strip().split()
        if len(parts) >= 2:
            nom    = parts[-1]
            prenom = " ".join(parts[:-1])
        else:
            nom    = passenger_name
            prenom = ""

        # ── 2. Créer passager ─────────────────────
        passager = Passager(
            nom       = nom,
            prenom    = prenom,
            email     = email,
            telephone = telephone
        )
        db.add(passager)
        db.flush()

        # ── 3. Créer réclamation ──────────────────
        token = secrets.token_hex(16)
        reclamation = Reclamation(
            public_token = token,
            passager_id  = passager.id,
            description  = description,
            category     = category,
        )
        db.add(reclamation)
        db.flush()  # ← flush pour avoir l'id sans commit

        # ── 4. Routing → assignation agent ────────
        agent = get_agent_by_category(db, category)
        if agent:
            reclamation.agent_id = agent.id
            print(f"✅ Routée vers {agent.email} ({category})")
        else:
            print(f"⚠️ Aucun agent trouvé pour {category}")

        # ── 5. Calcul priorité ────────────────────
        priorite = calculate_priority(
            type_contact = type_contact,
            category     = category
        )
        reclamation.priorite = priorite

        # ── 6. Un seul commit ! ───────────────────
        db.commit()
        db.refresh(reclamation)

        # ── 7. Upload boarding pass ───────────────
        file_url = ""
        if boarding_pass:
            try:
                file_url = upload_file(boarding_pass, folder="boarding-passes")
                print(f"✅ Boarding pass uploadé : {file_url}")
            except Exception as e:
                print(f"⚠️ MinIO non disponible : {e}")
                file_url = ""

        # ── 8. Créer carte d'embarquement ─────────
        carte = CarteEmbarquement(
            reclamation_id   = reclamation.id,
            file_url         = file_url,
            passenger_name   = passenger_name,
            vol              = flight_number,
            departure_airport= departure_airport,
            destination_airport = arrival_airport,
            departure_date   = departure_date,
            ocr_confidence   = None
        )
        db.add(carte)
        db.commit()

        # ── 9. Upload pièces jointes ──────────────
        if pieces:
            for piece in pieces:
                try:
                    piece_url = upload_file(piece, folder="claim-pieces")
                    pj = PieceJointe(
                        reclamation_id = reclamation.id,
                        nom_fichier    = piece.filename,
                        type_fichier   = piece.content_type,
                        url_stockage   = piece_url
                    )
                    db.add(pj)
                except Exception as e:
                    print(f"⚠️ Erreur upload pièce jointe : {e}")
            db.commit()

        # ── 10. Email confirmation ────────────────
        try:
            await send_confirmation_email(
                recipient_email = email,
                passenger_name  = passenger_name,
                token           = token,
                category        = category,
                created_at      = reclamation.created_at
            )
            print(f"✅ Email confirmation envoyé à {email}")
        except Exception as e:
            print(f"⚠️ Erreur email (réclamation créée quand même) : {e}")

        return ReclamationResponse(
            id           = reclamation.id,
            public_token = token,
            statut       = reclamation.statut.value,
            created_at   = reclamation.created_at,
            message      = "Réclamation créée avec succès. Vérifiez votre email.",
            suivi_url    = f"http://localhost:3000/suivi?token={token}"
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# ══════════════════════════════════════════════════
# GET /track/{token} → Suivi réclamation
# ══════════════════════════════════════════════════
@router.get("/track/{token}")
async def track_claim(token: str, db: Session = Depends(get_db)):
    reclamation = db.query(Reclamation).filter(
        Reclamation.public_token == token
    ).first()

    if not reclamation:
        raise HTTPException(
            status_code=404,
            detail="Réclamation introuvable. Vérifiez votre token."
        )

    return {
        "public_token": reclamation.public_token,
        "statut"      : reclamation.statut.value,
        "priorite"    : reclamation.priorite.value if reclamation.priorite else "NORMALE",
        "category"    : reclamation.category if reclamation.category else "Non spécifiée",
        "created_at"  : reclamation.created_at.isoformat(),
        "reponse"     : None
    }


# ══════════════════════════════════════════════════
# POST /extract-boarding-pass → OCR
# ══════════════════════════════════════════════════
@router.post("/extract-boarding-pass")
async def extract_boarding_pass(
    file: UploadFile = File(...),
    db  : Session    = Depends(get_db)
):
    try:
        temp_path = f"uploads/temp_{file.filename}"
        os.makedirs("uploads", exist_ok=True)

        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = extract_boarding_pass_info(temp_path, visualize=True)
        os.remove(temp_path)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════
# POST /verify-pnr → Vérification PNR
# ══════════════════════════════════════════════════
@router.post("/verify-pnr")
async def verify_pnr_endpoint(
    request: PNRVerifyRequest,
    db     : Session = Depends(get_db)
):
    result = verify_pnr(db, request.pnr_code)

    if not result.get("success"):
        raise HTTPException(
            status_code=404,
            detail=result.get("error")
        )

    return result


# ══════════════════════════════════════════════════
# GET /categories → Catégories publiques
# ══════════════════════════════════════════════════
@router.get("/categories")
async def get_categories_public(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return [
        {
            "id"         : c.id,
            "nom"        : c.nom,
            "description": c.description
        }
        for c in categories
    ]