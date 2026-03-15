from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class CarteEmbarquement(Base):
    __tablename__ = "cartes_embarquement"

    id = Column(Integer, primary_key=True, index=True)
    reclamation_id = Column(Integer, ForeignKey("reclamations.id"), nullable=False, unique=True)
    file_url = Column(String(500), nullable=False)
    passenger_name = Column(String(255), nullable=True)
    vol = Column(String(20), nullable=False)
    departure_airport = Column(String(10), nullable=False)
    destination_airport = Column(String(10), nullable=True)
    departure_date= Column(String(10), nullable=False)
    ocr_confidence = Column(Float, nullable=True)
    reclamation = relationship("Reclamation", back_populates="carte_embarquement")


    def __repr__(self):
        return f"<CarteEmbarquement id={self.id} passenger_name={self.passenger_name} vol={self.vol} departure_airport={self.departure_airport} destination_airport={self.destination_airport} departure_date={self.departure_date} ocr_confidence={self.ocr_confidence}>"