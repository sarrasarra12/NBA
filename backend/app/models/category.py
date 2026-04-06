# app/models/category.py - ajouter departement_id
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Category(Base):
    __tablename__ = "categories"

    id             = Column(Integer, primary_key=True, index=True)
    nom            = Column(String, unique=True, nullable=False)
    description    = Column(String, nullable=True)
    departement_id = Column(Integer, ForeignKey("departements.id"), nullable=True)
    # ← chaque catégorie sait dans quel département elle va !

    departement = relationship("Departement", back_populates="categories")