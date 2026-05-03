# app/routers/classifier_ia.py

from fastapi import APIRouter
from pydantic import BaseModel as PydanticBase
import requests as req

router = APIRouter(
    prefix="/api/agent-ia",
    tags=["Classifier IA"]
)

# ══════════════════════════════════════════════════
# Schéma de la requête entrante
# Pydantic valide automatiquement :
# → description existe ?
# → description est une string ?
# → Sinon → erreur 422 automatique
# ══════════════════════════════════════════════════
class ClassifierRequest(PydanticBase):
    description: str

# ══════════════════════════════════════════════════
# ENDPOINT — Classifier catégorie via Mistral
# async : FastAPI gère plusieurs requêtes
#         en parallèle sans bloquer le serveur
# ══════════════════════════════════════════════════
@router.post("/classifier")
async def classify_reclamation(
    request: ClassifierRequest
):
    # Format prompt identique au fine-tuning
    # Le modèle complète naturellement
    # après "### Categorie:"
    prompt = f"""### Reclamation: {request.description}
### Categorie:"""

    try:
        # Appel à l'API Ollama
        response = req.post(
            "http://localhost:11434/api/generate",
            json={
                # Notre modèle fine-tuné
                # créé avec : ollama create nouvelair -f Modelfile
                "model" : "nouvelair",

                "prompt": prompt,

                # False = réponse complète d'un coup
                # True  = réponse token par token (chat)
                "stream": False,

                "options": {
                    # 0.1 = réponse déterministe
                    # toujours la même catégorie
                    # pour la même description
                    "temperature" : 0.1,

                    # 15 tokens max
                    # catégorie = 1-3 mots
                    # pas besoin de plus
                    "num_predict" : 15,

                    # s'arrête dès qu'il voit :
                    # \n  = retour à la ligne
                    # ### = section suivante
                    # .   = fin de phrase
                    "stop" : ["\n", "###", "."]
                }
            },
            # si Ollama ne répond pas en 30s
            # → on abandonne proprement
            timeout = 30
        )

        # Nettoyer la réponse brute
        # .strip() → supprime espaces avant/après
        # .lower() → "Annulation" → "annulation"
        predicted = response.json()["response"].strip().lower()
        print(f"Prediction brute : {predicted}")

        # Catégories valides du système NouvelAir
        LABEL_MAPPING = {
            "retard"           : "RETARD_VOL",
            "bagage"           : "BAGAGE",
            "annulation"       : "ANNULATION",
            "remboursement"    : "REMBOURSEMENT",
            "service_aeroport" : "SERVICE_AEROPORT",
            "autre"            : "AUTRE"
        }

        categorie_predite = "AUTRE"

        for cat, label_officiel in LABEL_MAPPING.items():
            if cat in predicted:
                categorie_predite = label_officiel
                break
        return {
            "success"           : True,
            "categorie_predite" : categorie_predite,
        }



    # Si Ollama est éteint ou erreur réseau
    # → on retourne "autre" sans erreur HTTP
    # → le formulaire continue normalement
    # → pas d'impact sur la soumission
    except Exception as e:
        print(f"Erreur classifier : {e}")
        return {
            "success"           : False,
            "categorie_predite" : "AUTRE",
        }