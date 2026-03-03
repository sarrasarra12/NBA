from paddleocr import PaddleOCR
import re

print("🔍 TEST PADDLEOCR BACKEND\n")

# Init
ocr = PaddleOCR(use_angle_cls=True, lang='en')

# OCR
result = ocr.ocr("carte9.jpg")

# Extrait textes
texts = [line[1][0] for line in result[0]]
full_text = " ".join(texts)

print("📄 Texte détecté :")
print(full_text[:200], "...")
print()

# Parse
flight = re.search(r'\b(BJ\d{3,4})\b', full_text)
date = re.search(r'\b(\d{1,2}[A-Z]{3})\b', full_text)
time = re.search(r'\b(\d{2}:\d{2})\b', full_text)

codes_iata = re.findall(r'\b([A-Z]{3})\b', full_text)
airports = [c for c in codes_iata if c in ['CDG', 'DJE', 'TUN', 'MIR']]

print("🎯 Données extraites :")
print(f"✈️  Vol     : {flight.group(1) if flight else 'N/A'}")
print(f"🛫 Départ  : {airports[0] if len(airports) > 0 else 'N/A'}")
print(f"🛬 Arrivée : {airports[1] if len(airports) > 1 else 'N/A'}")
print(f"📅 Date    : {date.group(1) if date else 'N/A'}")
print(f"⏰ Heure   : {time.group(1) if time else 'N/A'}")

print("\n✅ PaddleOCR fonctionne dans le backend !")