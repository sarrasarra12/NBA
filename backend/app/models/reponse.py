from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class TypeReponse(enum.Enum):
    HUMAINE = "HUMAINE"     # Rédigée par un agent
    IA      = "IA"          # Générée par l'IA


class Reponse(Base):
    __tablename__ = "reponses"

    id              = Column(Integer, primary_key=True, index=True)
    reclamation_id  = Column(Integer, ForeignKey("reclamations.id"), nullable=False)
    agent_id        = Column(Integer, ForeignKey("agents_humains.id"), nullable=True)  # null si IA
    contenu         = Column(Text, nullable=False)
    source          = Column(Enum(TypeReponse), nullable=False, default=TypeReponse.HUMAINE)
    date_reponse    = Column(DateTime(timezone=True), server_default=func.now())
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    reclamation     = relationship("Reclamation", back_populates="reponses")
    agent           = relationship("AgentHumain", back_populates="reponses")

    def __repr__(self):
        return f"<Reponse id={self.id} reclamation_id={self.reclamation_id} source={self.source}>"