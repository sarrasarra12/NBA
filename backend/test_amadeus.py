from amadeus import Client, ResponseError
from dotenv import load_dotenv
import os

load_dotenv()

client = Client(
    client_id=os.getenv("AMADEUS_API_KEY"),
    client_secret=os.getenv("AMADEUS_API_SECRET"),
    hostname="test"
)

try:
    response = client.shopping.flight_offers_search.get(
        originLocationCode="MAD",
        destinationLocationCode="ATH",
        departureDate="2026-06-01",
        adults=1
    )
    print("✅ Succès !")
    print(response.data[0])

except ResponseError as error:
    print(f"Status : {error.response.status_code}")
    print(f"Body   : {error.response.body}")