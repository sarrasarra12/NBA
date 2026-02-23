#Enregistre quels cas historiques ont été utilisés pour générer
#chaque réponse IA, avec les scores de similarité.

from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class UtilisationConnaissance(Base):
    __tablename__ = "utilisation_connaissance"

    id = Column(Integer, primary_key=True, index=True)
    decision_ia_id = Column(Integer, ForeignKey("decisions_ia.id"), nullable=False)
    base_connaissance_id = Column(Integer, ForeignKey("base_connaissance.id"), nullable=False)
    score_similarite = Column(Float, nullable=False)
    date_utilisation = Column(DateTime(timezone=True), server_default=func.now())
    pertinence = Column(Float, nullable=True)

    decision_ia = relationship("DecisionIA", back_populates="utilisations_connaissance")
    base_connaissance = relationship("BaseConnaissance")

    def __repr__(self):
        return f"<UtilisationConnaissance id={self.id} decision_ia_id={self.decision_ia_id} base_connaissance_id={self.base_connaissance_id} score_similarite={self.score_similarite} date_utilisation={self.date_utilisation}>"