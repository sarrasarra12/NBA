from paddleocr import PaddleOCR
import re
from typing import Dict, Optional
import os

# Instance globale (chargée une seule fois au démarrage)
ocr_engine = None

def init_ocr():
    """Initialise PaddleOCR au démarrage du serveur"""
    global ocr_engine
    if ocr_engine is None:
        print("⏳ Initialisation PaddleOCR...")
        ocr_engine = PaddleOCR(use_angle_cls=True, lang='en')
        print("✅ PaddleOCR prêt")

def extract_boarding_pass_info(image_path: str) -> Dict:
    """
    Extrait les informations d'une carte d'embarquement
    
    Args:
        image_path: Chemin vers l'image
        
    Returns:
        dict: Informations extraites
    """
    # Initialiser si nécessaire
    if ocr_engine is None:
        init_ocr()
    
    try:
        # Vérifier que le fichier existe
        if not os.path.exists(image_path):
            return {
                "success": False,
                "error": f"Fichier introuvable: {image_path}"
            }
        
        # OCR
        result = ocr_engine.ocr(image_path)
        
        # Vérifier résultat
        if not result or not result[0]:
            return {
                "success": False,
                "error": "Aucun texte détecté"
            }
        
        # Extraire tout le texte
        texts = [line[1][0] for line in result[0]]
        full_text = " ".join(texts)
        
        print(f"📄 Texte OCR : {full_text[:200]}...")
        
        # Parser avec regex
        data = {
            "success": True,
            "flight_number": extract_flight_number(full_text),
            "departure_airport": extract_airport(full_text, 'departure'),
            "arrival_airport": extract_airport(full_text, 'arrival'),
            "departure_date": extract_date(full_text),
            "raw_text": full_text
        }
        
        print(f"✅ Extraction réussie : {data}")
        return data
        
    except Exception as e:
        print(f"❌ Erreur OCR : {e}")
        return {
            "success": False,
            "error": str(e)
        }


# ===== FONCTIONS D'EXTRACTION =====

def extract_flight_number(text: str) -> Optional[str]:
    """Extrait numéro de vol (BJ509)"""
    match = re.search(r'\b([A-Z]{2}\d{3,4})\b', text)
    return match.group(1) if match else None


def extract_airport(text: str, type: str) -> Optional[str]:
    """Extrait codes IATA"""
    known_airports = ['CDG', 'ORY', 'TUN', 'DJE', 'MIR', 'SFA', 'LHR', 'JFK', 'NCE']
    
    airports = re.findall(r'\b([A-Z]{3})\b', text)
    valid = [a for a in airports if a in known_airports]
    
    if len(valid) >= 2:
        return valid[0] if type == 'departure' else valid[1]
    elif len(valid) == 1:
        return valid[0]
    
    return None


def extract_date(text: str) -> Optional[str]:
    """Extrait date (16MAR)"""
    match = re.search(r'(\d{1,2}[A-Z]{3})', text)
    return match.group(1) if match else None


 