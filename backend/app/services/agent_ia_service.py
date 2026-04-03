# app/services/agent_ia_service.py

import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from app.services.rag_service import search_rules

load_dotenv()

GEMMA_API_KEY = os.getenv("GEMMA_API_KEY")

def generate_ia_response(
    description  : str,
    category     : str,
    passager_nom : str,
) -> dict:

    if not GEMMA_API_KEY:
        return {"success": False, "error": "GEMMA_API_KEY non configuree"}

    try:
        # ── STEP 1 : Chercher règles pertinentes via RAG ──
        query = f"{category} {description[:100]}"
        rules = search_rules(query, n_results=3)
        print(f"Regles trouvees : {rules[:200]}...")

        # ── STEP 2 : Construire prompt avec règles ────────
        prompt = f"""Tu es un expert en service client aerien pour NouvelAir.
Redige une reponse email professionnelle pour cette reclamation.

REGLES APPLICABLES :
{rules}

RECLAMATION :
Passager : {passager_nom}
Categorie : {category}
Description : {description}

INSTRUCTIONS :
- Commence TOUJOURS par : Cher/chere client(e),
- Cite les regles applicables avec numeros exacts
- Mentionne les droits concrets avec montants precissi si applicable
- Propose une solution claire avec delai de traitement(si rembourssemnt valisé demande tous ce qui est nécessaire ; num de compte bancaire, RIB, etc)
- Termine par formule de politesse professionnelle
- Reponds en francais dans le réclamation en français, en anglais dans la réclamation en anglais et en arable dans la réclamation en arabe
- Sois empathique et professionnel
-ne fais pas des longues explications, sois concis et clair 
-Ne donne pas des rembourssement que si tous les documents valiés 
-Analyse bien la description  et les piéces jointes récu 

Reponds UNIQUEMENT avec la reponse email, rien d autre."""

        # ── STEP 3 : Appel Gemma ──────────────────────────
        model    = genai.GenerativeModel('gemma-3-4b-it')
        response = model.generate_content(prompt)
        reponse_text = response.text.strip()

        return {
            "success"       : True,
            "reponse"       : reponse_text,
            "rules_used"    : rules[:500],
            "score_confiance": 0.85
        }

    except Exception as e:
        print(f"Erreur Agent IA : {e}")
        return {"success": False, "error": str(e)}