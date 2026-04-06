from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from jinja2 import Template
import os
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

def get_env_or_error(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise ValueError(f"Variable {key} non trouvée dans .env")
    return value

# ── Configuration SMTP ─────────────────────────────
try:
    conf = ConnectionConfig(
        MAIL_USERNAME   = get_env_or_error("MAIL_USERNAME"),
        MAIL_PASSWORD   = get_env_or_error("MAIL_PASSWORD"),
        MAIL_FROM       = os.getenv("MAIL_FROM", "noreply@nouvelair.com"),
        MAIL_PORT       = int(os.getenv("MAIL_PORT", 587)),
        MAIL_SERVER     = os.getenv("MAIL_SERVER", "smtp.gmail.com"),
        MAIL_STARTTLS   = True,
        MAIL_SSL_TLS    = False,
        USE_CREDENTIALS = True,
        VALIDATE_CERTS  = True
    )
    print(f"✅ Configuration email chargée pour {os.getenv('MAIL_USERNAME')}")
except ValueError as e:
    print(str(e))
    conf = ConnectionConfig(
        MAIL_USERNAME   = "",
        MAIL_PASSWORD   = "",
        MAIL_FROM       = "noreply@nouvelair.com",
        MAIL_PORT       = 587,
        MAIL_SERVER     = "smtp.gmail.com",
        MAIL_STARTTLS   = True,
        MAIL_SSL_TLS    = False,
        USE_CREDENTIALS = True,
        VALIDATE_CERTS  = True
    )

fm = FastMail(conf)


# ══════════════════════════════════════════════════
# FONCTION DE BASE
# ══════════════════════════════════════════════════
async def send_email(to: str, subject: str, body: str) -> bool:
    if not os.getenv("MAIL_USERNAME") or not os.getenv("MAIL_PASSWORD"):
        print("ERREUR: MAIL_USERNAME ou MAIL_PASSWORD non configuré")
        return False
    try:
        message = MessageSchema(
            subject    = subject,
            recipients = [to],
            body       = body,
            subtype    = "html"
        )
        await fm.send_message(message)
        print(f"✅ Email envoyé à {to}")
        return True
    except Exception as e:
        print(f"Erreur envoi email : {e}")
        import traceback
        traceback.print_exc()
        return False


# ══════════════════════════════════════════════════
# EMAIL CONFIRMATION SOUMISSION
# ══════════════════════════════════════════════════
async def send_confirmation_email(
    recipient_email : str,
    passenger_name  : str,
    token           : str,
    category        : str,
    created_at      : datetime
):
    if not os.getenv("MAIL_USERNAME") or not os.getenv("MAIL_PASSWORD"):
        print("ERREUR: MAIL_USERNAME ou MAIL_PASSWORD non configuré")
        return False

    try:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        tracking_url = f"{frontend_url}/suivi?token={token}"

        template_path = Path(__file__).parent.parent / "templates" / "confirmation_email.html"
        if not template_path.exists():
            print(f"Template non trouvé : {template_path}")
            return False

        with open(template_path, "r", encoding="utf-8") as f:
            html_template = Template(f.read())

        html_content = html_template.render(
            passenger_name  = passenger_name,
            token           = token,
            category        = category,
            date_soumission = created_at.strftime("%d/%m/%Y à %H:%M"),
            tracking_url    = tracking_url,
            logo_url        = "https://i.imgur.com/hRKnF8M.png"
        )

        return await send_email(
            to      = recipient_email,
            subject = f"Confirmation de votre réclamation #{token}",
            body    = html_content
        )

    except Exception as e:
        print(f"Erreur send_confirmation_email : {e}")
        import traceback
        traceback.print_exc()
        return False


# ══════════════════════════════════════════════════
# EMAIL RÉPONSE AGENT
# ══════════════════════════════════════════════════
async def send_reponse_email(
    to              : str,
    passenger_name  : str,
    reclamation_id  : int,
    category        : str,
    flight_number   : str,
    reponse_contenu : str,
    departement     : str,
    tracking_url    : str,
    logo_url        : str,
):
    # Signature selon département
    signatures = {
        "BAGAGE"        : "Service Bagages NouvelAir · bagages@nouvelair.com",
        "SERVICE_CLIENT": "Service Client NouvelAir · service@nouvelair.com",
        "CALL_CENTRE"   : "Call Centre NouvelAir · callcentre@nouvelair.com",
    }
    signature = signatures.get(departement, "Service Client NouvelAir")

    try:
        template_path = Path(__file__).parent.parent / "templates" / "reponse_agent.html"
        if not template_path.exists():
            print(f"Template non trouvé : {template_path}")
            return False

        with open(template_path, "r", encoding="utf-8") as f:
            html_template = Template(f.read())

        html_content = html_template.render(
            passenger_name        = passenger_name,
            reclamation_id        = reclamation_id,
            category              = category,
            flight_number         = flight_number or 'N/A',
            reponse_contenu       = reponse_contenu,
            departement           = departement,
            date_reponse          = datetime.now().strftime('%d/%m/%Y à %H:%M'),
            tracking_url          = tracking_url,
            logo_url              = logo_url,
            signature_departement = signature
        )

        return await send_email(
            to      = to,
            subject = f"Réponse NouvelAir - Réclamation #{reclamation_id}",
            body    = html_content
        )

    except Exception as e:
        print(f"Erreur send_reponse_email : {e}")
        import traceback
        traceback.print_exc()
        return False

