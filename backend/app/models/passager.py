from sqlalchemy import Column , Integer , String 
from app.core.database import Base
from sqlalchemy.orm import relationship
class Passager(Base):
    __tablename__ = "passagers"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(255), index=True,nullable=True)
    prenom = Column(String(255), index=True)
    email = Column(String(255),  index=True,nullable=False)
    telephone = Column(String(50), nullable=False)

    # Relation vers réclamations
    reclamations = relationship("Reclamation", back_populates="passager")

    def __repr__(self):
      return f"<Passager id={self.id} nom={self.nom} prenom={self.prenom} email={self.email} telephone={self.telephone}>"

