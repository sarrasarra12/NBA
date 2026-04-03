from app.core.database import SessionLocal
from app.models.reservation import Reservation
from datetime import datetime, time
from app.models.category import Category
from app.models.departement import Departement
import uuid

print(" Test insertion Reservation...")
print("=" * 50)

db = SessionLocal()

reservations_data = [
    {"passenger_name": "PASSENGER1", "flight_number": "BJ594", "departure_airport": "MIR", "arrival_airport": "NCE", "departure_date": "30SEP", "departure_time": "08:00", "status": "confirmed"},
    {"passenger_name": "PASSENGER2", "flight_number": "BJ543", "departure_airport": "CDG", "arrival_airport": "MIR", "departure_date": "17JUL", "departure_time": "09:15", "status": "confirmed"},
    {"passenger_name": "PASSENGER3", "flight_number": "BJ170", "departure_airport": "TUN", "arrival_airport": "CMN", "departure_date": "01APR", "departure_time": "06:45", "status": "confirmed"},
    {"passenger_name": "PASSENGER4", "flight_number": "BJ509", "departure_airport": "CDG", "arrival_airport": "DJE", "departure_date": "20FEB", "departure_time": "11:30", "status": "confirmed"},
    {"passenger_name": "PASSENGER5", "flight_number": "BJ520", "departure_airport": "TUN", "arrival_airport": "CDG", "departure_date": "13NOV", "departure_time": "14:20", "status": "confirmed"},
    {"passenger_name": "PASSENGER6", "flight_number": "BJ509", "departure_airport": "CDJ", "arrival_airport": "DJE", "departure_date": "16MAR", "departure_time": "07:50", "status": "confirmed"},
    {"passenger_name": "PASSENGER7", "flight_number": "BJ232", "departure_airport": "TUN", "arrival_airport": "BER", "departure_date": "28NOV", "departure_time": "12:10", "status": "confirmed"},
]

# Convertir dates courtes en datetime.date
def parse_date(date_str):
    return datetime.strptime(date_str.upper() + "2026", "%d%b%Y").date()

# Convertir heures en datetime.time
def parse_time(time_str):
    return datetime.strptime(time_str, "%H:%M").time()

try:
    for res in reservations_data:
        reservation = Reservation(
            pnr_code=str(uuid.uuid4())[:6].upper(),  # code unique 6 caractères
            passenger_name=res["passenger_name"],
            flight_number=res["flight_number"],
            departure_airport=res["departure_airport"],
            arrival_airport=res["arrival_airport"],
            departure_date=parse_date(res["departure_date"]),
            departure_time=parse_time(res["departure_time"]),
            email=f"{res['passenger_name'].lower()}@example.com",  # email fictif
            phone="0000000000",  # numéro fictif pour satisfaire NOT NULL
            status=res["status"],
        )
        db.add(reservation)
    
    db.commit()
    total = db.query(Reservation).count()
    print(f"✅ {len(reservations_data)} réservations insérées avec succès !")
    print(f"📊 Total réservations dans la base : {total}")
    
except Exception as e:
    print(f"❌ Erreur : {e}")
    db.rollback()
finally:
    db.close()

print("=" * 50)