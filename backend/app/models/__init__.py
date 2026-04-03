# app/models/__init__.py

from app.core.database import Base

from app.models.passager           import Passager
from app.models.departement        import Departement
from app.models.agent_humain       import AgentHumain
from app.models.reclamation        import Reclamation
from app.models.carte_embarquement import CarteEmbarquement
from app.models.piece_jointe       import PieceJointe
from app.models.reservation        import Reservation
from app.models.reponse            import Reponse
from app.models.reponse_humaine    import ReponseHumaine  # ← nom correct
from app.models.reponse_ia         import ReponseIA       # ← nom correct
from app.models.feedback           import Feedback

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
    "ReponseHumaine",   # ← nom correct
    "ReponseIA",        # ← nom correct
    "Feedback",
]