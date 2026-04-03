# app/models/departement.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Departement(Base):
    __tablename__ = "departements"

    id          = Column(Integer, primary_key=True, index=True)
    nom         = Column(String, nullable=False)
    responsable = Column(String, nullable=True)
    email       = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    # ← string au lieu de classe directe
    category = relationship("Category", back_populates="departement")
    agents   = relationship("AgentHumain", back_populates="departement")