from sqlalchemy import Column, Integer , String, Boolean ,DateTime
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy.orm import relationship
#class Agent huamin 
class AgentHumain(Base):
    __tablename__ = "agents_humains"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(255), index=True, nullable=False)
    prenom = Column(String(255), index=True, nullable=False)
    email = Column(String(255), index=True, nullable=False)
    mot_de_passe = Column(String(255), nullable=False)
  # Stocker le mot de passe hashé
    role = Column(String(50), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<AgentHumain id={self.id} nom={self.nom} prenom={self.prenom} email={self.email} mot_de_passe={self.mot_de_passe} role={self.role} last_login={self.last_login} created_at={self.created_at}>"

