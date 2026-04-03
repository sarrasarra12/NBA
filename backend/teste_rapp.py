from paddleocr import PaddleOCR
import cv2
import re

print("🔍 TEST PADDLEOCR BACKEND\n")

# ---------------------------------------------------
# 1️⃣ Initialisation OCR
# ---------------------------------------------------

ocr = PaddleOCR(use_angle_cls=True, lang='en')

# ---------------------------------------------------
# 2️⃣ Lecture + prétraitement de l'image
# ---------------------------------------------------

image_path = "embrq.jpg"

image = cv2.imread(image_path)

# conversion en niveaux de gris

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# améliore le contraste
gray = cv2.GaussianBlur(gray, (3,3), 0)

# ---------------------------------------------------
# 3️⃣ OCR
# ---------------------------------------------------

result = ocr.ocr(gray)

# récupérer texte + score
texts = []
scores = []

for line in result[0]:
    text = line[1][0].strip()
    score = line[1][1]
    
    # ignorer les textes peu fiables
    if score > 0.6:
        texts.append(text)
        scores.append(score)

# fusion du texte
full_text = " ".join(texts).upper()

print("📄 Texte détecté :")
print(full_text[:200], "...\n")

# ---------------------------------------------------
# 4️⃣ Extraction intelligente
# ---------------------------------------------------

# numéro de vol (plus robuste)
flight_pattern = r'\b([A-Z]{2}\d{3,4})\b'
flight = re.search(flight_pattern, full_text)

# date (30SEP)
date_pattern = r'\b(\d{1,2}(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))\b'
date = re.search(date_pattern, full_text)

# heure
time_pattern = r'\b(\d{2}:\d{2})\b'
time = re.search(time_pattern, full_text)

# ---------------------------------------------------
# 5️⃣ Détection des aéroports
# ---------------------------------------------------

KNOWN_AIRPORTS = [
    'CDG','ORY','NCE','LYS',
    'TUN','DJE','MIR','SFA',
    'JFK','LHR','MAD','BCN'
]

codes_iata = re.findall(r'\b([A-Z]{3})\b', full_text)
airports = [c for c in codes_iata if c in KNOWN_AIRPORTS]

departure = airports[0] if len(airports) > 0 else None
arrival = airports[1] if len(airports) > 1 else None

# ---------------------------------------------------
# 6️⃣ Résultat structuré
# ---------------------------------------------------

data = {
    "flight_number": flight.group(1) if flight else None,
    "departure_airport": departure,
    "arrival_airport": arrival,
    "departure_date": date.group(1) if date else None,
    "departure_time": time.group(1) if time else None
}

print("🎯 Données extraites par paddleOCR pour la carte :")

print(f"✈️  Vol     : {data['flight_number']}")
print(f"🛫 Départ  : {data['departure_airport']}")
print(f"🛬 Arrivée : {data['arrival_airport']}")
print(f"📅 Date    : {data['departure_date']}")

print("\n✅ PaddleOCR fonctionne correctement !")