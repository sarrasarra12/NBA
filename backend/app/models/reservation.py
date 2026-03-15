from sqlalchemy import Column, String, Date, Time
from app.core.database import Base

class Reservation(Base):
    __tablename__ = "reservations"

    pnr_code = Column(String(6), primary_key=True)
    flight_number = Column(String(10), nullable=False)
    departure_airport = Column(String(3), nullable=False)
    arrival_airport = Column(String(3), nullable=True)
    departure_date = Column(Date, nullable=False)  # changer en Date
    departure_time = Column(Time, nullable=False)  # changer en Time
    passenger_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)   # ajouter nullable=False
    phone = Column(String(20), nullable=True)
    seat = Column(String(5), nullable=True)
    status = Column(String(20), nullable=False)