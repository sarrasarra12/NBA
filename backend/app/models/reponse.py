# app/models/reponse.py

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Reponse(Base):
    __tablename__ = "reponses"

    id             = Column(Integer, primary_key=True, index=True)
    reclamation_id = Column(Integer, ForeignKey("reclamations.id"), nullable=False)
    contenu        = Column(Text, nullable=False)
    date_reponse   = Column(DateTime(timezone=True), server_default=func.now())
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    type           = Column(String(50), nullable=False)
    # ↑ discriminateur → "humaine" ou "ia"

    __mapper_args__ = {
        'polymorphic_on'      : type,
        'polymorphic_identity': 'reponse'
        # polymorphic_on : quel badge(etudiant/prof..)
        # polymorphic_identity : c'est mon badge (ici on dit : humaine ou ia )
    }

    # Relations
    reclamation = relationship("Reclamation", back_populates="reponses")
