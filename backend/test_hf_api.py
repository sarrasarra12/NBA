import requests

API_URL = "https://router.huggingface.co/hf-inference/models/sarrasarra12/nouvelair-mistral-finetuned"

response = requests.post(
    API_URL,
    headers = {"Content-Type": "application/json"},
    json    = {
        "inputs": "### Reclamation: Mon vol annule\n### Categorie: annulation\n### Reponse:"
    }
)

print(f"Status : {response.status_code}")
print(f"Text   : {response.text[:300]}")