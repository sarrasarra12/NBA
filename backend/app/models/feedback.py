# app/models/feedback.py

from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Feedback(Base):
    __tablename__ = "feedbacks"

    id          = Column(Integer, primary_key=True, index=True)
    note        = Column(Integer, nullable=False)      # 1 à 5
    commentaire = Column(Text, nullable=True)          # optionnel
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Feedback id={self.id} note={self.note} page={self.page}>"