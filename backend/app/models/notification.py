from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    reclamation_id = Column(Integer, ForeignKey("reclamations.id"), nullable=False)
    decision_ia_id = Column(Integer, ForeignKey("decisions_ia.id"), nullable=True)
    contenu = Column(Text, nullable=False)
    date_envoi = Column(DateTime(timezone=True), server_default=func.now())
    reclamation = relationship("Reclamation", back_populates="notifications")
    decision_ia = relationship("DecisionIA", back_populates="notifications")

    def __repr__(self):
        return f"<Notification id={self.id} reclamation_id={self.reclamation_id} decision_ia_id={self.decision_ia_id} contenu={self.contenu} date_envoi={self.date_envoi}>"