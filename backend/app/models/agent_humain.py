from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class RoleAgent(enum.Enum):
    ADMIN          = "ADMIN"           # Superviseur - voit tout
    AGENT          = "AGENT"           # Agent - voit son département seulement


class AgentHumain(Base):
    __tablename__ = "agents_humains"

    id              = Column(Integer, primary_key=True, index=True)
    nom             = Column(String(255), nullable=False)
    prenom          = Column(String(255), nullable=False)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    mot_de_passe    = Column(String(255), nullable=False)   # hashé avec bcrypt
    role            = Column(Enum(RoleAgent), nullable=False, default=RoleAgent.AGENT)
    departement_id  = Column(Integer, ForeignKey("departements.id"), nullable=True)  # null pour ADMIN
    is_active       = Column(Boolean, default=True)
    last_login      = Column(DateTime(timezone=True), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    departement     = relationship("Departement", back_populates="agents")
    reclamations_assignees = relationship("Reclamation", back_populates="agent")  

    def __repr__(self):
        return f"<AgentHumain id={self.id} email={self.email} role={self.role}>"