#avec schema on utilise des régles de validation pour les données d'entrées (formulaire) et sortie API sortanate pour qu "on assure la cohearnce des deonnes 
# on utilise pydantic pour créer des schémas de validation"
#Quelqu'un envoi n'importe quoi 
from typing import Optional
from pydantic import BaseModel, EmailStr,Field
from datetime import datetime
class PNRVerifyRequest(BaseModel):
    pnr_code: str


class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    date: str
    adults: int = 1
class ReclamationCreate(BaseModel):
    #info about vol
    passenger_name: str = Field(...,min_length=2, max_length=255)
    flight_number: str =Field(...,min_length=2, max_length=20)
    departure_airport : str = Field(...,min_length=2, max_length=10)
    arrival_airport : str = Field (...,min_length=2, max_length=10)
    departure_time :str = Field(...,min_length=4, max_length=10)

    #Contact 
    email: EmailStr = Field(...)
    telephone : str = Field(...,min_length=8, max_length=20)

    #description de la reclamation
    description: str = Field(...,min_length=10)
    pir_reference: Optional[str] = Field(None, max_length=50)  
    type_contact: str = Field(..., pattern="^(PASSAGER|AVOCAT|ASSOCIATION|AGENCE)$")
#mainetant réponse envoyé au passager apres soumission de rec

class ReclamationResponse(BaseModel):
    id: int
    public_token: str 
    statut: str 
    created_at : datetime
    message: str 
    suivi_url: str 
#cette classe permet de convertir de SQLALchemy vers JSON
    class config:
        from_attributes = True

   
   