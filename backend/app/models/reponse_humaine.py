# app/models/reponse_humaine.py

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.reponse import Reponse


class ReponseHumaine(Reponse):
    __tablename__ = "reponses_humaines"
    # ↑ table séparée pour les données spécifiques

    id       = Column(Integer, ForeignKey("reponses.id"), primary_key=True)
    # ↑ FK vers la table parent reponses

    agent_id = Column(Integer, ForeignKey("agents_humains.id"), nullable=False)
    # ↑ champ spécifique → qui a rédigé la réponse

    __mapper_args__ = {
        'polymorphic_identity': 'humaine'
        # ↑ quand type = "humaine" → SQLAlchemy utilise cette classe
    }

    # Relations
    agent = relationship("AgentHumain")
    #depuis une réponse on peut accéder à l'agent 