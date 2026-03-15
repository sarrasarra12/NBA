from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey, Enum, String  # ← String ajouté
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class AgentIA(Base):
    __tablename__ = "agents_ia"

    id              = Column(Integer, primary_key=True, index=True)
    reclamation_id  = Column(Integer, ForeignKey("reclamations.id"), nullable=False)
    score_confiance = Column(Float, nullable=True)
    priorite        = Column(String(50), nullable=True)
    categorie       = Column(String(100), nullable=True)
    compensation    = Column(Float, nullable=True, default=0.0)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    reclamation     = relationship("Reclamation", back_populates="analyse_ia")

    def __repr__(self):
        return f"<AgentIA id={self.id} reclamation_id={self.reclamation_id} score={self.score_confiance}>"