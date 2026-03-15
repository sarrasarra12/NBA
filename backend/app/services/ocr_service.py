#Importer le modéle ocr qui contient les 3 modéles IA (DBNet, SVTR, CRNN)
from paddleocr import PaddleOCR
#module pour les expressions réguliéres , cherche les patterns dans le texte
import re
#lire l'image et convertir de BGR->RGB
import cv2
#manipuler les coordonées des boites (x,y)
import numpy as np
#crée figure et affihce rl 'image 
import matplotlib.pyplot as plt
#patch dessine les rectangles vert
import matplotlib.patches as patches
#definir les types de fonctions
from typing import Dict, Optional
from pathlib import Path
#pour appeler service gemini en cas d'echec de paddle
from app.services.gemma_service import extract_with_gemma




# Inititilisation du paddleOCR dans le back lors du démarrage
ocr_engine = None

#use_angle_cls=True : corrige l'angle
# lang='en' :  charge le dictionnaire ang pour reconnaisance CRNN
def init_ocr():
    global ocr_engine
    if ocr_engine is None:
        ocr_engine = PaddleOCR(use_angle_cls=True, lang='en')

# Visualisation matplotlib

# Regex ; outil pour chercher,vérifier ou modifier le texte en utilisant un pattern

def extract_flight_number(text: str) -> Optional[str]:
    match = re.search(r'\b([A-Z]{2}\d{3,4})\b', text)
    return match.group(1) if match else None

def extract_airport(text: str, type: str) -> Optional[str]:
    known = ['MRS','MLH','NTE','SXB','TLS','LIL','DUS','FRA','STR','HAJ','HAM','MXP','CAG','VRN','AHO','BGY','FCO','OPO','RAK','RBA','CMN','SAW','AYT','SFA','TOE','NBE','CAI','HME','ALG','GVA','IST','BCN','MAD','MLA','CDG', 'ORY', 'TUN', 'DJE', 'MIR', 'SFA', 'LHR', 'JFK', 'NCE', 'LYS']
    found = [a for a in re.findall(r'\b([A-Z]{3})\b', text) if a in known]
    if len(found) >= 2:
        return found[0] if type == 'departure' else found[1]
    return found[0] if found else None

def extract_passenger_name(text: str) -> Optional[str]:
    match = re.search(r'/([A-Z]+)', text)
    if match and match.group(1) not in ['BOARDING', 'PASS', 'GATE', 'SEAT', 'FLIGHT']:
        return match.group(1)
    return None

def extract_departure_date(text: str) -> Optional[str]:
    match = re.search(r'(?<!\w)(\d{2}[A-Z]{3})(?!\w)', text)
    if not match:
        # fallback: cherche même sans séparateurs stricts
        match = re.search(r'(\d{2}(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))', text)
    return match.group(1) if match else None


# Extraction principale(si l'un de ces champs manque , appele gemini )
REQUIRED = ["flight_number", "departure_airport", "arrival_airport", "departure_date"]

def extract_boarding_pass_info(image_path: str, visualize: bool = False) -> Dict:
    if ocr_engine is None:
        init_ocr()

    try:
        result = ocr_engine.ocr(image_path)# ici on lance les 3 modéle en cascade (boite + texte + score)
        if not result or not result[0]:
            return extract_with_gemma(image_path)

    
        # ici on assemble tous le texte en une seule ligne pour faire le regex
        full_text = " ".join(line[1][0].upper().strip() for line in result[0])

        data = {
            "success":           True,
            "flight_number":     extract_flight_number(full_text),
            "departure_airport": extract_airport(full_text, "departure"),
            "arrival_airport":   extract_airport(full_text, "arrival"),
            "departure_date":    extract_departure_date(full_text),
            "passenger_name":    extract_passenger_name(full_text),
            "method":            "paddleocr",
            "raw_text":          full_text
        }
        # si un des champs obligatire (none) essayer avec gemini
        if not all(data.get(f) for f in REQUIRED):
            gemma_result = extract_with_gemma(image_path)
            if gemma_result.get("success"):
                return gemma_result

        return data
    # si une erreur arrive on utilise directement gemini 
    except Exception as e:
        return extract_with_gemma(image_path)