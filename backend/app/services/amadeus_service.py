from amadeus import Client, ResponseError
import os
from typing import Dict

# Client Amadeus global
amadeus_client = None

def init_amadeus():
    """Initialise le client Amadeus au démarrage"""
    global amadeus_client
    
    api_key = os.getenv('AMADEUS_API_KEY')
    api_secret = os.getenv('AMADEUS_API_SECRET')
    hostname = os.getenv('AMADEUS_HOSTNAME', 'test')
    
    if not api_key or not api_secret:
        print("⚠️ Credentials Amadeus manquants dans .env")
        return False
    
    try:
        amadeus_client = Client(
            client_id=api_key,
            client_secret=api_secret,
            hostname=hostname
        )
        print(f"✅ Amadeus initialisé (mode: {hostname})")
        return True
    except Exception as e:
        print(f"❌ Erreur init Amadeus: {e}")
        return False


def search_flights(origin: str, destination: str, date: str) -> Dict:
    """
    Recherche vols via Amadeus
    """
    if not amadeus_client:
        return {
            "success": False,
            "error": "Amadeus non initialisé"
        }
    
    try:
        print(f"🔍 Recherche: {origin} → {destination} le {date}")
        
        response = amadeus_client.shopping.flight_offers_search.get(
            originLocationCode=origin,
            destinationLocationCode=destination,
            departureDate=date,
            adults=1,
            max=5
        )
        
        flights = []
        for offer in response.data:
            segment = offer['itineraries'][0]['segments'][0]
            flights.append({
                "flight_number": f"{segment['carrierCode']}{segment['number']}",
                "departure": {
                    "airport": segment['departure']['iataCode'],
                    "time": segment['departure']['at']
                },
                "arrival": {
                    "airport": segment['arrival']['iataCode'],
                    "time": segment['arrival']['at']
                },
                "price": offer['price']['total'],
                "currency": offer['price']['currency']
            })
        
        print(f"✅ {len(flights)} vols trouvés")
        
        return {
            "success": True,
            "count": len(flights),
            "flights": flights
        }
        
    except ResponseError as error:
        print(f"❌ Erreur Amadeus: {error}")
        return {
            "success": False,
            "error": str(error)
        }
    except ResponseError as error:
        print(f"❌ Erreur Amadeus: {error}")
        print(f"❌ Status code: {error.response.status_code}")
        print(f"❌ Body: {error.response.body}")  # ← ajoute ça
        return {
            "success": False,
            "error": str(error.response.body)  # ← et ça
        }