from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class StatutReclamation(enum.Enum):

    NOUVELLE = "NOUVELLE"                   # Réclamation créée, pas encore traitée
    EN_ANALYSE = "EN_ANALYSE"               # En cours d'analyse 
    ATTENTE_INFOS = "ATTENTE_INFOS"         # Besoin d'infos supplémentaires (stocke messgae qui vuent apres forword )
    FORWARDED = "FORWARDED"                 # Transférée à un superviseur (autre service)
    APPROUVEE = "APPROUVEE"                 # stcoke les reclamation cloturer 
    REPLIED = "REPLIED"                     # Réponse dy passager en cas de communicate 
    CLOTURED = "CLOTURED"                   # Fermée définitivement

class Priorite(enum.Enum):
    
    ELEVEE = "ELEVEE"          # Priorité 7-8
    MOYENNE = "MOYENNE"        # Priorité 4-6
    NORMALE = "NORMALE"        # Priorité 1-3

class ArchiveCategory(enum.Enum):
    
    Attend_de_Response = "Attend_de_Response" #attend de réponse d'un autre service 
    REPONDU = "REPONDU" # Passager répond en cas de cmmunication
    APPROUVE = "APPROUVE" # stockgae des recl cloturer 

class Reclamation(Base):
    __tablename__ = "reclamations"

    id = Column(Integer, primary_key=True, index=True)
    public_token = Column(String(32), unique=True, nullable=False, index=True)
    passager_id = Column(Integer, ForeignKey("passagers.id"), nullable=False)
    description = Column(Text, nullable=False)
    langue = Column(String(10), nullable=False, default="fr")
    statut = Column(Enum(StatutReclamation), default=StatutReclamation.NOUVELLE, nullable=False)
    priorite = Column(Enum(Priorite), default=Priorite.NORMALE, nullable=False)
    archive_category = Column(Enum(ArchiveCategory), nullable=True) # Catégorie d'archivage
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)
    #agent_id = Column(Integer, ForeignKey("agents_humains.id"), nullable=True)


    passager = relationship("Passager", back_populates="reclamations")
    carte_embarquement = relationship("CarteEmbarquement", back_populates="reclamation", uselist=False)
    pieces_jointes = relationship("PieceJointe", back_populates="reclamation")  # ← AJOUTER
    decision_ia = relationship("DecisionIA", back_populates="reclamation", uselist=False)
    notifications = relationship("Notification", back_populates="reclamation")

    def __repr__(self):
        return f"<Reclamation id={self.id} public_token={self.public_token} passager_id={self.passager_id} description={self.description} langue={self.langue} statut={self.statut} priorite={self.priorite} archive_category={self.archive_category} created_at={self.created_at} updated_at={self.updated_at} closed_at={self.closed_at} agent_id={self.agent_id} pieces_jointes={len(self.pieces_jointes)}>"