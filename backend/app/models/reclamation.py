from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class StatutReclamation(enum.Enum):
    NOUVELLE    = "NOUVELLE"      # Créée, pas encore traitée
    EN_ANALYSE  = "EN_ANALYSE"    # En cours d'analyse
    CLOTURED    = "CLOTURED"      # Fermée définitivement


class Priorite(enum.Enum):
    ELEVEE  = "ELEVEE"     # Priorité 7-8
    MOYENNE = "MOYENNE"    # Priorité 4-6
    NORMALE = "NORMALE"    # Priorité 1-3


class Reclamation(Base):
    __tablename__ = "reclamations"

    id              = Column(Integer, primary_key=True, index=True)
    public_token    = Column(String(32), unique=True, nullable=False, index=True)
    passager_id     = Column(Integer, ForeignKey("passagers.id"), nullable=False)
    agent_id        = Column(Integer, ForeignKey("agents_humains.id"), nullable=True)  # ✅ décommenté
    departement_id  = Column(Integer, ForeignKey("departements.id"), nullable=True)    # ✅ ajouté
    description     = Column(Text, nullable=False)
    langue          = Column(String(10), nullable=False, default="fr")
    pir_reference   = Column(String(50), nullable=True)
    statut          = Column(Enum(StatutReclamation), default=StatutReclamation.NOUVELLE, nullable=False)
    priorite        = Column(Enum(Priorite), default=Priorite.NORMALE, nullable=False)
    category        = Column(String(100), nullable=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())
    closed_at       = Column(DateTime(timezone=True), nullable=True)

    # Relations
    passager            = relationship("Passager", back_populates="reclamations")
    agent               = relationship("AgentHumain", back_populates="reclamations_assignees")
    departement         = relationship("Departement")#plusierus reclemation appartient a un  dept 
    carte_embarquement  = relationship("CarteEmbarquement", back_populates="reclamation", uselist=False)
    pieces_jointes      = relationship("PieceJointe", back_populates="reclamation")
    feedback            = relationship("Feedback", back_populates="reclamation", uselist=False)

    def __repr__(self):
        return f"<Reclamation id={self.id} token={self.public_token} statut={self.statut}>"