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
        img = Image.open(image_path)
        
        # Prompt optimisé
        prompt = """Tu es un expert en lecture de cartes d'embarquement.
Analyse cette carte d'embarquement et extrait les informations.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans explication.

Format EXACT attendu :
{
  "flight_number"    : "numéro de vol commence toujours par 'BJ' (ex: BJ509)",
  "departure_airport": "code IATA départ 3 lettres MAJUSCULES (ex: CDG, TUN, DJE,IST)",
  "arrival_airport"  : "code IATA arrivée 3 lettres MAJUSCULES (ex: CDG, TUN, DJE,IST)",
  "departure_date"   : "date format DDMMM (ex: 16MAR, 01APR, 25DEC)",
  "passenger_name"   : "NOM PRENOM en majuscules si visible" 
}
RÈGLES STRICTES :
1. flight_number   → cherche "FLIGHT", "VOL"
2. departure_airport → code IATA 3 lettres à GAUCHE du symbole ✈
3. arrival_airport   → code IATA 3 lettres à DROITE du symbole ✈
4. departure_airport et arrival_airport sont TOUJOURS différents !
5. departure_date  → cherche format DDMMM (16MAR) ou DD/MM/YYYY → convertis en DDMMM
6. passenger_name  → cherche en haut où vous trouvez MR ou Mrs et se touve toujours en majuscules,
7. Si un champ n'est pas visible → laisse une chaîne vide ""
8. Ne jamais inventer une valeur → vide si incertain

Réponds UNIQUEMENT avec le JSON, rien d'autre."""


## Ce qui a été amélioré


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