import enum
from sqlalchemy import Column, Integer, String, Enum as SQLEnum
from sqlalchemy import Column , Integer , String 
from app.core.database import Base
from sqlalchemy.orm import relationship

class TypeContact(enum.Enum):
    PASSAGER = "PASSAGER"
    AVOCAT = "AVOCAT"
    ASSOCIATION = "ASSOCIATION"
    AGENCE = "AGENCE"

class Passager(Base):
    __tablename__ = "passagers"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(255), index=True,nullable=True)
    prenom = Column(String(255), index=True)
    email = Column(String(255),  index=True,nullable=False)
    telephone = Column(String(50), nullable=False)
    type_contact = Column(SQLEnum(TypeContact), nullable=False, default=TypeContact.PASSAGER)


    # Relation vers réclamations
    reclamations = relationship("Reclamation", back_populates="passager")
  


    def __repr__(self):
      return f"<Passager id={self.id} nom={self.nom} prenom={self.prenom} email={self.email} telephone={self.telephone}>"

