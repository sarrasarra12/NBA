
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class DecisionIA(Base):
    __tablename__ = "decisions_ia"

    id = Column(Integer, primary_key=True, index=True)
    reclamation_id = Column(Integer, ForeignKey("reclamations.id"), nullable=False, unique=True)
    categorie_detectee = Column(String(100), nullable=True)
    priorite = Column(String(20), nullable=True)
    resume_auto = Column(Text, nullable=True)
    reponse_generee = Column(Text, nullable=True)
    compensation_estimee = Column(Float, nullable=True)
    score_confiance = Column(Float, nullable=True)
    modifiee_par_agent = Column(Boolean, default=False)
    date_analyse = Column(DateTime(timezone=True), server_default=func.now())

    reclamation = relationship("Reclamation", back_populates="decision_ia")
    notifications = relationship("Notification", back_populates="decision_ia")
    utilisations_connaissance = relationship("UtilisationConnaissance", back_populates="decision_ia")

    def __repr__(self):
        return f"<DecisionIA id={self.id} reclamation_id={self.reclamation_id} categorie_detectee={self.categorie_detectee} priorite={self.priorite} resume_auto={self.resume_auto} reponse_generee={self.reponse_generee} compensation_estimee={self.compensation_estimee} score_confiance={self.score_confiance} modifiee_par_agent={self.modifiee_par_agent} date_analyse={self.date_analyse}>"