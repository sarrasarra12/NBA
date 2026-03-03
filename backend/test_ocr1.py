from paddleocr import PaddleOCR
import re

# Initialisation PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en')

# OCR
image_path = "carte8.jpg.png"  # mettre le bon chemin
result = ocr.ocr(image_path)

# Extraction des textes détectés
texts = [line[1][0] for line in result[0]]
full_text = " ".join(texts)

# Nettoyage du texte pour éviter les erreurs d'espaces ou caractères parasites
full_text = re.sub(r'[^A-Z0-9/ ]', '', full_text.upper())  # majuscules + chiffres + / + espaces
full_text = re.sub(r'\s+', ' ', full_text)  # fusion des espaces multiples

# 🔹 Extraction des informations
# Numéro de vol (ex : BJ594)
flight = re.search(r'\b([A-Z]{2}\d{3,4})\b', full_text)

# Date (ex : 30SEP, 01APR)
date = re.search(r'\b(\d{1,2}[A-Z]{3})\b', full_text)

# Codes IATA (ex : CDG, TUN, MIR)
codes_iata = re.findall(r'\b([A-Z]{3})\b', full_text)
known_airports = ['CDG', 'DJE', 'TUN', 'MIR', 'NCE', 'CMN']
airports = [c for c in codes_iata if c in known_airports]

# Pour gérer les vols où départ/arrivée sont inversés
depart = airports[0] if len(airports) > 0 else 'N/A'
arrivee = airports[1] if len(airports) > 1 else (airports[0] if len(airports)==1 else 'N/A')

# 🔹 Affichage résultats
print("📄 Texte OCR :")
print(full_text[:200], "...\n")  # affiche les 200 premiers caractères

print("🎯 Données extraites :")
print(f"✈️  Vol     : {flight.group(1) if flight else 'N/A'}")
print(f"🛫 Départ  : {depart}")
print(f"🛬 Arrivée : {arrivee}")
print(f"📅 Date    : {date.group(1) if date else 'N/A'}")