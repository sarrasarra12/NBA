import google.generativeai as genai
from PIL import Image
import json
import os
from typing import Dict, Optional
from dotenv import load_dotenv
import time


load_dotenv()
# Configuration
GEMMA_API_KEY = os.getenv("GEMMA_API_KEY")
#Initialise Gemini au démarrage dans le back
def init_gemma():

    if GEMMA_API_KEY:
        genai.configure(api_key=GEMMA_API_KEY)
        print("✅ Gemma API configuré")
    else:
        print("⚠️  GEMMA_API_KEY non configuré (fallback désactivé)")


def extract_with_gemma(image_path: str) -> Dict:
    if not GEMMA_API_KEY:
        return {
            "success": False,
            "error": "Gemma API key non configurée" # s'il y a un probléme avec api key
        }
    
    try:
        # Initialiser le modèle
        model = genai.GenerativeModel('gemma-3-4b-it')
        #gemma-3-4b-it
        #gemini-2.5-flash'
        
        
        # Charger l'image
        img = Image.open("embrq.jpg")
        
        # Prompt optimisé
        prompt = """
Analyse cette carte d'embarquement et extrait les informations.
Réponds UNIQUEMENT avec un objet JSON valide, sans markdown :

{
  "flight_number": "numéro de vol (ex: BJ509)",
  "departure_airport": "code IATA départ 3 lettres (ex: CDG)",
  "arrival_airport": "code IATA arrivée 3 lettres (ex: DJE)",
  "departure_date": "date au format DDMMM (ex: 16MAR)",
  "departure_time": "heure HH:MM si visible",
  "passenger_name": "nom du passager si visible"
}

Règles STRICTES :
- departure_airport = ville/aéroport de DÉPART (d'où part l'avion)
- arrival_airport = ville/aéroport d'ARRIVÉE (où arrive l'avion)
- Les deux codes arrival_airport et departure_airport  sont TOUJOURS différents
- Cherche les mots clés : Code IATA 3 lette majuscule entre une petit avion 
- Si non visible = vide 
  
}

Si un champ n'est pas visible, laisse vide .
"""

        # Extraction
        start_time = time.time()
        response = model.generate_content([prompt, img])
        end_time = time.time()

        # analyser le contenu pour faire l'extraction
        text = response.text.strip()
        
        # Nettoyer markdown si présent
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
               text = text[4:]
            text = text.strip()
        
        # Parser JSON
        data = json.loads(text)
        
        print(f"  Gemma extraction : {data}")
        print(f"✅ Gemma – Temps d’extraction : {end_time - start_time:.2f} secondes")

        
        return {
            "success": True,
            "flight_number": data.get("flight_number"),
            "departure_airport": data.get("departure_airport"),
            "arrival_airport": data.get("arrival_airport"),
            "departure_date": data.get("departure_date"),
            "passenger_name": data.get("passenger_name"),
            "raw_data": data
        }
        

    
    except Exception as e:
        print(f"Erreur Gemma : {e}")
        return {
            "success": False,
            "error": str(e)
        }