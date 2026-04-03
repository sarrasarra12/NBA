# app/models/reponse_ia.py

from sqlalchemy import Column, Integer, Float, ForeignKey
from app.models.reponse import Reponse


class ReponseIA(Reponse):
    __tablename__ = "reponses_ia"
    # ↑ table séparée pour les données spécifiques

    id              = Column(Integer, ForeignKey("reponses.id"), primary_key=True)
    # ↑ FK vers la table parent reponses

    score_confiance = Column(Float, nullable=True)
    # ↑ champ spécifique → score de confiance de l'IA

    __mapper_args__ = {
        'polymorphic_identity': 'ia'
        # ↑ quand type = "ia" → SQLAlchemy utilise cette classe
    }