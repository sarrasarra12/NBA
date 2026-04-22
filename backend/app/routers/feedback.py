# app/routers/feedback.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.feedback import Feedback

router = APIRouter(
    prefix="/api/feedback",
    tags=["Feedback"]
)

class FeedbackRequest(BaseModel):
    note       : int
    commentaire: str = ""

@router.post("")
async def soumettre_feedback(
    data : FeedbackRequest,
    db   : Session = Depends(get_db)
):
    if data.note < 1 or data.note > 5:
        raise HTTPException(
            status_code = 400,
            detail      = "La note doit être entre 1 et 5"
        )

    feedback = Feedback(
        note        = data.note,
        commentaire = data.commentaire
    )
    db.add(feedback)
    db.commit()

    print(f"Feedback reçu : note={data.note}")

    return {
        "success": True,
        "message": "Merci pour votre feedback !"
    }