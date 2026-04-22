# app/services/agent_ia_service.py

import requests

OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "nouvelair"

# ══════════════════════════════════════════════════════
# INSTRUCTIONS PAR CATÉGORIE
# Chaque instruction guide le modèle pour générer
# une réponse professionnelle et complète
# ══════════════════════════════════════════════════════
INSTRUCTIONS = {

    # ── Retard de vol ──────────────────────────────────
    "retard": """
Contexte réglementaire : Règlement EU261/2004
Instructions :
1. Présenter les excuses sincères de NouvelAir
2. Expliquer brièvement la cause du retard
3. Si retard >= 2h : proposer rafraîchissements et repas
4. Si retard >= 3h : informer le passager de son droit
   à indemnisation selon EU261/2004 :
   - Vol <= 1500 km      → 250 EUR
   - Vol 1500 à 3500 km  → 400 EUR
   - Vol > 3500 km       → 600 EUR
5. Demander les coordonnées bancaires :
   - Nom complet du titulaire
   - IBAN
   - BIC/SWIFT
6. Préciser délai de traitement : 7 jours ouvrés
""",

    # ── Annulation de vol ──────────────────────────────
    "annulation": """
Contexte réglementaire : Règlement EU261/2004 
Instructions :
1. Présenter les excuses sincères de NouvelAir
2. Expliquer brièvement la cause de l'annulation
3. Proposer au passager le choix entre :
   - Remboursement intégral du billet
   - Réacheminement vers la destination finale
4. Si remboursement choisi → demander :
   - Nom complet du titulaire
   - IBAN
   - BIC/SWIFT
5. Informer du droit à indemnisation :
   - Vol <= 1500 km      → 250 EUR
   - Vol 1500 à 3500 km  → 400 EUR
   - Vol > 3500 km       → 600 EUR
6. Préciser délai de traitement : 7 jours ouvrés
""",

    # ── Bagage perdu / endommagé / retardé ─────────────
    "bagage": """
Contexte réglementaire : Convention de Montréal 
Instructions :
1. Présenter les excuses sincères de NouvelAir
2. Demander les informations nécessaires :
   - Référence PIR (Property Irregularity Report)
   - Image du bagage si n'a pas déja enpoyé+ Description détaillée du bagage
     (couleur, marque, contenu approximatif)
   - Date et numéro du vol concerné
3. Informer le passager de ses droits :
   - Bagage perdu    → indemnisation max 1 288 DTS
   - Bagage endommagé → indemnisation max 1 288 DTS
   - Bagage retardé  → indemnisation max 1 288 DTS
4. Si dédommagement applicable → demander :
   - Nom complet du titulaire
   - IBAN
   - BIC/SWIFT
5. Préciser délai de traitement : 21 jours ouvrés
""",

    # ── Remboursement ──────────────────────────────────
    "remboursement": """
Contexte réglementaire : Règlement EU261/2004 et Convention de Montréal
Instructions :
1. Présenter les excuses sincères de NouvelAir pour le retard du rembousement dans le cas d'un retard 
2. Sinon Confirmer le droit au remboursement du passager
3. Préciser la base légale applicable :
   - EU261/2004 si retard ou annulation
   - Convention de Montréal si problème bagage
4. Demander les coordonnées bancaires :
   - Nom complet du titulaire
   - IBAN
   - BIC/SWIFT
   - Banque domiciliataire
5. Préciser délai de traitement : 7 jours ouvrés
6. Indiquer le montant estimé si applicable
""",

    # ── Service aéroport ───────────────────────────────
    "service_aeroport": """
Contexte réglementaire : Règlement EU261/2004 
Instructions :
1. Présenter les excuses sincères de NouvelAir
2. Accuser réception de la réclamation
3. Demander des détails supplémentaires :
   - Date et numéro du vol
   - Description précise de l'incident
   - Nom des agents impliqués si disponible
4. Si préjudice prouvé → informer du droit
   à indemnisation selon EU261/2004
5. Proposer un suivi personnalisé du dossier
6. Communiquer les coordonnées du service client
""",

    # ── Autre ──────────────────────────────────────────
    "autre": """
Instructions :
1. Présenter les excuses sincères de NouvelAir
2. Accuser réception de la réclamation
3. Demander des informations complémentaires
   pour mieux traiter le dossier
4. Proposer un suivi personnalisé
5. Communiquer les coordonnées du service client
   NouvelAir pour toute question supplémentaire
"""
}


def generate_ia_response(
    description  : str,
    category     : str,
    passager_nom : str,
) -> dict:

    try:
        print(f"Appel Ollama — catégorie : {category}")

        # ── Récupérer instruction selon catégorie ──────
        instruction = INSTRUCTIONS.get(
            category.lower(),
            INSTRUCTIONS["autre"]
        )

        # ── Construire le prompt enrichi ───────────────
        prompt = f"""
Tu es un assistant IA spécialisé dans le traitement des réclamations de la compagnie NouvelAir.

RÈGLE CRITIQUE (OBLIGATOIRE) :
- Tu DOIS répondre STRICTEMENT dans la même langue que la réclamation.
- Si la réclamation est en arabe → réponse EN ARABE uniquement.
- Si la réclamation est en anglais → réponse EN ANGLAIS uniquement.
- Si la réclamation est en français → réponse EN FRANÇAIS uniquement.
- Il est INTERDIT de changer de langue.

### Réclamation : {description}
### Catégorie : {category}
### Passager : {passager_nom}

### Instructions détaillées :
{instruction}

### Réponse :
"""

        # ── Appel Ollama ───────────────────────────────
        response = requests.post(
            OLLAMA_URL,
            json={
                "model"  : OLLAMA_MODEL,
                "prompt" : prompt,
                "stream" : False,
                "options": {
                    "temperature"   : 0.7,
                    "repeat_penalty": 1.3,
                    "num_predict"   : 500,
                }
            },
            timeout = 120
        )

        reponse_text = response.json()["response"].strip()
        print(f"Réponse générée avec succès !")

        return {
            "success"        : True,
            "reponse"        : reponse_text,
            "model_used"     : "nouvelair-mistral-finetuned",
            "score_confiance": 0.90
        }

    except Exception as e:
        print(f"Erreur Ollama : {e}")
        return {
            "success": False,
            "error"  : str(e)
        }