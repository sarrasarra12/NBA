# test_token.py
import requests
import os
from dotenv import load_dotenv
load_dotenv()

token = os.getenv("HF_TOKEN")
print(f"Token lu : '{token}'")
print(f"Longueur : {len(token) if token else 0}")

# Test token
response = requests.get(
    "https://huggingface.co/api/whoami",
    headers={"Authorization": f"Bearer {token}"}
)
print(f"Status : {response.status_code}")
print(f"Reponse : {response.json()}")