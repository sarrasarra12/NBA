# app/models/__init__.py

from app.core.database import Base

# Models sans dépendances
from app.models.passager import Passager
from app.models.departement import Departement
from app.models.agent_humain import AgentHumain

# Models avec dépendances
from app.models.reclamation import Reclamation
from app.models.carte_embarquement import CarteEmbarquement
from app.models.piece_jointe import PieceJointe
from app.models.reservation import Reservation
from app.models.reponse import Reponse
from app.models.feedback import Feedback
from app.models.agent_ia import AgentIA

# Exposer tout
__all__ = [
    "Base",
    "Passager",
    "Departement",
    "AgentHumain",
    "Reclamation",
    "CarteEmbarquement",
    "PieceJointe",
    "Reservation",
    "Reponse",
    "Feedback",
    "AgentIA",
]