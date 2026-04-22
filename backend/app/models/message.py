from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func 
from sqlalchemy.orm import relationship
from app.core.database import Base 

class Message(Base):
    __tablename__ = "messages"

    id               = Column(Integer, primary_key=True, index=True)
    expediteur_id    = Column(Integer, ForeignKey("agents_humains.id"),
                             nullable=False)
    destinataire_id  = Column(Integer, ForeignKey("agents_humains.id"),
                             nullable=False)
    contenu          = Column(Text, nullable=False)
    lu               = Column(Boolean, default=False)
    created_at       = Column(DateTime(timezone=True),
                             server_default=func.now())

    # Relations
    expediteur   = relationship("AgentHumain",
                               foreign_keys=[expediteur_id])
    destinataire = relationship("AgentHumain",
                               foreign_keys=[destinataire_id])

    def __repr__(self):
        return f"<Message id={self.id} de={self.expediteur_id} à={self.destinataire_id}>"