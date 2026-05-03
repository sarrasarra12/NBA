# app/services/agent_ia_service.py

import requests

OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "nouvelair"

# ══════════════════════════════════════════════════════
# DÉTECTION DE LA LANGUE
# ══════════════════════════════════════════════════════
def detect_langue(text: str) -> str:
    mots_anglais = ['flight', 'delayed', 'cancelled', 'luggage', 'baggage',
                    'refund', 'compensation', 'ticket', 'booking', 'airport',
                    'complaint', 'lost', 'damaged', 'would like', 'my flight']
    mots_arabes  = ['رحلة', 'تأخير', 'حقيبة', 'الطائرة', 'مطار', 'تعويض',
                    'إلغاء', 'أريد', 'السلام', 'طيران', 'تذكرة', 'استرداد']
    text_lower = text.lower()
    if any(m in text_lower for m in mots_anglais): return 'english'
    if any(m in text           for m in mots_arabes):  return 'arabic'
    return 'french'


# ══════════════════════════════════════════════════════
# RÈGLES PAR CATÉGORIE — multilingue
# ══════════════════════════════════════════════════════
REGLES = {
    "RETARD_VOL": {
        "french" : """Règlement EU261/2004 :
- Excuses sincères + expliquer brièvement la cause
- Retard >= 2h → proposer repas et rafraîchissements
- Retard >= 3h → compensation due :
  • <= 1500 km → 250€  |  1500-3500 km → 400€  |  > 3500 km → 600€
- Demander IBAN + BIC/SWIFT pour virement
- Délai traitement : 7 jours ouvrés""",

        "english": """EU Regulation 261/2004:
- Sincere apologies + brief explanation of the delay
- Delay >= 2h → offer meals and refreshments
- Delay >= 3h → compensation due:
  • <= 1500 km → €250  |  1500-3500 km → €400  |  > 3500 km → €600
- Request IBAN + BIC/SWIFT for bank transfer
- Processing time: 7 working days""",

        "arabic" : """اللائحة الأوروبية EU261/2004:
- اعتذار صادق + شرح موجز لسبب التأخير
- تأخير >= 2 ساعة → تقديم وجبات ومرطبات
- تأخير >= 3 ساعات → تعويض مستحق:
  • <= 1500 كم → 250€  |  1500-3500 كم → 400€  |  > 3500 كم → 600€
- طلب IBAN + BIC/SWIFT للتحويل البنكي
- مدة المعالجة: 7 أيام عمل""",
    },

    "ANNULATION": {
        "french" : """Règlement EU261/2004 :
- Excuses sincères + expliquer brièvement la cause
- Proposer AU CHOIX du passager (pas les deux) :
  • Remboursement intégral du billet → demander IBAN + BIC/SWIFT
  • OU réacheminement vers destination finale
- Si annulation < 14 jours → compensation due :
  • <= 1500 km → 250€  |  1500-3500 km → 400€  |  > 3500 km → 600€
- Délai traitement : 7 jours ouvrés""",

        "english": """EU Regulation 261/2004:
- Sincere apologies + brief explanation
- Offer passenger a CHOICE (not both):
  • Full refund → request IBAN + BIC/SWIFT
  • OR re-routing to final destination
- If cancellation < 14 days notice → compensation due:
  • <= 1500 km → €250  |  1500-3500 km → €400  |  > 3500 km → €600
- Processing time: 7 working days""",

        "arabic" : """اللائحة الأوروبية EU261/2004:
- اعتذار صادق + شرح موجز للسبب
- تقديم خيار للمسافر (ليس الاثنين معاً):
  • استرداد كامل → طلب IBAN + BIC/SWIFT
  • أو إعادة التوجيه للوجهة النهائية
- إلغاء < 14 يوم → تعويض مستحق:
  • <= 1500 كم → 250€  |  1500-3500 كم → 400€  |  > 3500 كم → 600€
- مدة المعالجة: 7 أيام عمل""",
    },

    "BAGAGE": {
        "french" : """Convention de Montréal :
- Excuses sincères
- Demander : numéro PIR + description bagage + numéro de vol
- Indemnisation maximale : 1 288 DTS (~1 500€)
- Demander IBAN + BIC/SWIFT
- Délai traitement : 21 jours ouvrés""",

        "english": """Montreal Convention:
- Sincere apologies
- Request: PIR number + baggage description + flight number
- Maximum compensation: 1,288 SDR (~€1,500)
- Request IBAN + BIC/SWIFT
- Processing time: 21 working days""",

        "arabic" : """اتفاقية مونتريال:
- اعتذار صادق
- طلب: رقم PIR + وصف الحقيبة + رقم الرحلة
- التعويض الأقصى: 1288 حق سحب خاص (~1500€)
- طلب IBAN + BIC/SWIFT
- مدة المعالجة: 21 يوم عمل""",
    },

    "REMBOURSEMENT": {
        "french" : """- Excuses sincères + confirmer le droit au remboursement
- Demander : IBAN + BIC/SWIFT + banque domiciliataire
- Délai traitement : 7 jours ouvrés""",

        "english": """- Sincere apologies + confirm right to refund
- Request: IBAN + BIC/SWIFT + bank name
- Processing time: 7 working days""",

        "arabic" : """- اعتذار صادق + تأكيد حق المسافر في الاسترداد
- طلب: IBAN + BIC/SWIFT + اسم البنك
- مدة المعالجة: 7 أيام عمل""",
    },

    "SERVICE_AEROPORT": {
        "french" : """- Excuses sincères
- Demander : date + numéro vol + description précise de l'incident
- Proposer un suivi personnalisé du dossier""",

        "english": """- Sincere apologies
- Request: date + flight number + precise description of the incident
- Offer personalized follow-up""",

        "arabic" : """- اعتذار صادق
- طلب: التاريخ + رقم الرحلة + وصف دقيق للحادثة
- تقديم متابعة شخصية للملف""",
    },

    "AUTRE": {
        "french" : """- Excuses sincères
- Accuser réception de la réclamation
- Demander informations complémentaires si nécessaire
- Proposer un suivi personnalisé""",

        "english": """- Sincere apologies
- Acknowledge receipt of the complaint
- Request additional information if needed
- Offer personalized follow-up""",

        "arabic" : """- اعتذار صادق
- الاعتراف باستلام الشكوى
- طلب معلومات إضافية إذا لزم الأمر
- تقديم متابعة شخصية""",
    },
}


# ══════════════════════════════════════════════════════
# CONSTRUCTION DU PROMPT
# ══════════════════════════════════════════════════════
def build_prompt(description, category, passager_nom, langue, regles):

    cat_key = category.upper()
    regle   = regles.get(cat_key, regles["AUTRE"]).get(langue, regles["AUTRE"]["french"])

    if langue == 'english':
        return f"""You are an AI assistant for NouvelAir airline. RESPOND IN ENGLISH ONLY.

Passenger: {passager_nom}
Complaint: {description}
Category: {category}

Rules to follow:
{regle}

Write a professional email response in English:"""

    elif langue == 'arabic':
        return f"""أنت مساعد ذكاء اصطناعي لشركة نوفيلير. يجب الرد باللغة العربية فقط.

المسافر: {passager_nom}
الشكوى: {description}
الفئة: {category}

القواعد الواجب اتباعها:
{regle}

اكتب رداً بريدياً احترافياً باللغة العربية:"""

    else:
        return f"""Tu es un assistant IA pour NouvelAir. RÉPONDS EN FRANÇAIS UNIQUEMENT.

### Réclamation : {description}
### Catégorie : {category}
### Passager : {passager_nom}

### Règles :
{regle}

### Réponse :"""


# ══════════════════════════════════════════════════════
# FONCTION PRINCIPALE
# ══════════════════════════════════════════════════════
def generate_ia_response(
    description  : str,
    category     : str,
    passager_nom : str,
) -> dict:

    try:
        langue = detect_langue(description)
        print(f"Appel Ollama — catégorie : {category} — langue : {langue}")

        prompt = build_prompt(description, category, passager_nom, langue, REGLES)

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
            timeout=120
        )

        reponse_text = response.json()["response"].strip()
        print(f"Réponse générée — langue : {langue}")

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