import json
import time
from PIL import Image
from paddleocr import PaddleOCR
import google.generativeai as genai

# ---------------------------
# CONFIGURATION
# ---------------------------

# PaddleOCR
ocr = PaddleOCR(lang='en', use_angle_cls=True, rec=True, det=True)

# Gemini API
genai.configure(api_key="AIzaSyBNe0nnYh19NtUvK66uRr6q66plV7RAYZo")  # <-- Mets ta clé Gemini ici
model = genai.GenerativeModel('gemini-2.5-flash')

# Image
image_path = "carte8.jpg.png"
img = Image.open(image_path)

# ---------------------------
# Étape 1 : OCR PaddleOCR
# ---------------------------
print("🔍 Extraction avec PaddleOCR...")
result = ocr.ocr(image_path, cls=True)

# Récupération du texte
paddle_text = []
for line in result:
    for word_info in line:
        text = word_info[-1][0]
        paddle_text.append(text)

paddle_text_str = " ".join(paddle_text)
print("Texte détecté par PaddleOCR :")
print(paddle_text_str)

# ---------------------------
# Étape 2 : Fallback Gemini si PaddleOCR échoue
# ---------------------------
if not paddle_text_str.strip():  # PaddleOCR n'a rien trouvé
    print("\nPaddleOCR n'a rien trouvé, fallback Gemini OCR...")

    prompt = """
Extrait les informations de cette carte d'embarquement.
Réponds UNIQUEMENT en JSON (pas de markdown) :

{
  "flight_number": "...",
  "departure_airport": "...",
  "arrival_airport": "...",
  "date": "...",
  "time": "...",
  "passenger_name": "...",
  "seat": "...",
  "gate": "..."
}
"""
    start = time.time()
    response = model.generate_content([prompt, img])
    temps = time.time() - start

    # Nettoyage du texte
    text = response.text.strip()
    if "```" in text:
        text = text.split("```")[1].replace("json", "").strip()

    try:
        data = json.loads(text)
    except Exception as e:
        print("❌ Impossible de parser Gemini OCR :", e)
        data = None

    if data:
        print(f"\n✅ Résultats Gemini (temps {temps:.2f}s) :")
        for k, v in data.items():
            print(f"{k:20s}: {v}")
    else:
        print("❌ Gemini n'a rien extrait non plus.")

else:
    print("\n✅ PaddleOCR a extrait du texte, pas besoin de fallback.")