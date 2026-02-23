#base de donnée des cas historique validées
# elle est uilisé par le systéme RAG :
 # -ChromaDB indexe ce cas
 # -Groq les utilise pour générer des réponses personalisé

from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy.orm import relationship 
class BaseConnaissance(Base):
    __tablename__ = "base_connaissance"

    id = Column(Integer, primary_key=True, index=True)
    categorie = Column(String(100), nullable=False)
    num_vol = Column(String(20), nullable=True)
    type_probleme = Column(String(255), nullable=False)
    solution = Column(Text, nullable=False)
    #solution utilisé par RAG pour génere des réponses 
    compensation_validee = Column(Float, nullable=True)
    date_validation = Column(DateTime(timezone=True), server_default=func.now())
    utilisations = relationship("UtilisationConnaissance", back_populates="base_connaissance")

    def __repr__(self):
        return f"<BaseConnaissance id={self.id} categorie={self.categorie} num_vol={self.num_vol} type_probleme={self.type_probleme} solution={self.solution} compensation_validee={self.compensation_validee} date_validation={self.date_validation}>"