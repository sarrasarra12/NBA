# app/routers/claims.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.reclamation import ReclamationResponse
from app.models import Passager, Reclamation, CarteEmbarquement,PieceJointe
from app.services.file_storage import upload_file
import secrets
from typing import List, Optional

router = APIRouter(
    prefix="/api/claims",
    tags=["Claims"]
)

@router.post("/", response_model=ReclamationResponse, status_code=status.HTTP_201_CREATED)
async def create_claim(
    passenger_name: str = Form(...),
    email: str = Form(...),
    telephone: str = Form(...),
    description: str = Form(...),
    flight_number: str = Form(...),
    departure_airport: str = Form(...),
    arrival_airport: str = Form(...),
    departure_time: str = Form(...),
    boarding_pass: Optional[UploadFile] = File(None, description="Carte d'embarquement (image ou PDF)"),
    pieces: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db)
    ):
    try:
        # 1. Détecter langue
        try:
            from langdetect import detect
            langue = detect(description)
        except:
            langue = "fr"

        # 2. Séparer nom et prénom
        parts = passenger_name.strip().split()
        if len(parts) >= 2:
            nom = parts[-1]
            prenom = " ".join(parts[:-1])
        else:
            nom = passenger_name
            prenom = ""

        # 3. Créer passager
        passager = Passager(nom=nom, prenom=prenom, email=email, telephone=telephone)
        db.add(passager)
        db.flush()

        # 4. Créer réclamation
        token = secrets.token_hex(16)
        reclamation = Reclamation(
            public_token=token,
            passager_id=passager.id,
            description=description,
            langue=langue
        )
        db.add(reclamation)
        db.commit()
        db.refresh(reclamation)

        # 5. Upload boarding pass sur MinIO
        file_url = ""
        if boarding_pass:
            file_url = upload_file(boarding_pass, folder="boarding-passes")
            print(f" Fichier uploadé : {file_url}")

        # 6. Créer carte d'embarquement
        carte = CarteEmbarquement(
            reclamation_id=reclamation.id,
            file_url=file_url,
            passenger_name=passenger_name,
            vol=flight_number,
            departure_airport=departure_airport,
            destination_airport=arrival_airport,
            departure_time=departure_time,
            ocr_confidence=None
        )
        db.add(carte)
        db.commit()
        #uploader les pirces jointes
        if pieces:
            for piece in pieces:
                piece_url = upload_file(piece, folder="claim-pieces")
                pj = PieceJointe(
                    reclamation_id=reclamation.id,
                    nom_fichier=piece.filename,
                    type_fichier=piece.content_type,
                    url_stockage=piece_url
                )
                db.add(pj)
            db.commit()

        return ReclamationResponse(
            id=reclamation.id,
            public_token=token,
            statut=reclamation.statut.value,
            created_at=reclamation.created_at,
            message="Réclamation créée avec succès",
            suivi_url=f"http://localhost:3000/suivi?token={token}"
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{token}")
async def get_claim_status(token: str, db: Session = Depends(get_db)):
    reclamation = db.query(Reclamation).filter(
        Reclamation.public_token == token
    ).first()
    if not reclamation:
        raise HTTPException(status_code=404, detail="Token invalide")
    return {
        "statut": reclamation.statut.value,
        "created_at": reclamation.created_at
    }
@router.post("/upload-boarding-pass")
async def upload_boarding_pass(
    boarding_pass: UploadFile = File(...)
):
    try:
        file_url = upload_file(boarding_pass, folder="boarding-passes")
        return {"file_url": file_url, "message": "Fichier uploadé avec succès"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))