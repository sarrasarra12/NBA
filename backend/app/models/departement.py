from sqlalchemy import Column , Integer , String , Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum 

class NomDepartement(enum.Enum):
    BAGAGE =" BAGAGE"
    CALL_CENTRE ="CALL_CENTRE"
    SERVICE_CLIENT ="SERVICE_CLIENT"

class Departement (Base):
    __tablename__ = "departements"

    id =  Column(Integer, primary_key=True,index=True)
    nom =  Column(Enum(NomDepartement),unique=True , nullable = False)
    responsable = Column(String(255), nullable= True)
    email = Column (String(255), nullable=True)

    #relations 
    agents = relationship("AgentHumain", back_populates="departement")
def __repr__(self):
    return f"<Departement id={self.id} nom={self.nom}>"