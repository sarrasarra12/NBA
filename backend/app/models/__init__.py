# app/models/__init__.py

# Python exécute ce fichier ligne par ligne
from app.core.database import Base

# Models sans dépendances
from app.models.passager import Passager
from app.models.agent_humain import AgentHumain

# Models avec dépendances
from app.models.reclamation import Reclamation
from app.models.carte_embarquement import CarteEmbarquement
from app.models.piece_jointe import PieceJointe
from app.models.decision_ia import DecisionIA
from app.models.notification import Notification
from app.models.base_connaisance import BaseConnaissance
from app.models.utilisationConnaissance import UtilisationConnaissance
# Exposer tout
__all__ = [
    "Base",
    "Passager",
    "AgentHumain",
    "Reclamation",
    "CarteEmbarquement",
    "PieceJointe",
    "DecisionIA",
    "Notification",
    "BaseConnaissance",
    "UtilisationConnaissance"
]