from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

    id              = Column(Integer, primary_key=True, index=True)
    passager_id     = Column(Integer, ForeignKey("passagers.id"), nullable=False)
    reclamation_id  = Column(Integer, ForeignKey("reclamations.id"), nullable=False)
    note            = Column(Integer, nullable=False)        # 1 à 5
    commentaire     = Column(Text, nullable=True)
    date            = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    passager        = relationship("Passager", back_populates="feedbacks")
    reclamation     = relationship("Reclamation", back_populates="feedback")

    def __repr__(self):
        return f"<Feedback id={self.id} note={self.note} passager_id={self.passager_id}>"