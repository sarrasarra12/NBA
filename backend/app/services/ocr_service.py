from paddleocr import PaddleOCR
import re

class BoardingPassOCR:
    def __init__(self):
        self.ocr = PaddleOCR(use_angle_cls=True, lang='en')

    def extract_data(self, image_path):
        result = self.ocr.ocr(image_path)

        # Extraire le texte brut
        texts = [line[1][0] for line in result[0]]
        full_text = " ".join(texts)

        # Correction date collée (16MAR20:05 → 16MAR 20:05)
        full_text = re.sub(r'(\d{2}[A-Z]{3})(\d{2}:\d{2})', r'\1 \2', full_text)

        data = {
            "flight_number": None,
            "departure": None,
            "arrival": None,
            "date": None,
            "time": None
        }

        # ✈️ Numéro de vol
        flight_match = re.search(r'(?:FLIGHT#?|NDEVOL)\s*([A-Z]{1,3}\d{2,4})', full_text)
        if flight_match:
            data["flight_number"] = flight_match.group(1)

        # 📅 Date
        date_match = re.search(r'\b\d{1,2}[A-Z]{3}\b', full_text)
        if date_match:
            data["date"] = date_match.group()

        # ⏰ Heure
        time_match = re.search(r'\b\d{2}:\d{2}\b', full_text)
        if time_match:
            data["time"] = time_match.group()

        # 🛫 Aéroports connus (IATA)
        known_airports = ["CDG", "DJE", "TUN", "ORY", "NCE"]
        airports = [a for a in known_airports if a in full_text]

        if len(airports) >= 2:
            data["departure"] = airports[0]
            data["arrival"] = airports[1]

        return data