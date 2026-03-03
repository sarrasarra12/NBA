from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from jinja2 import Template #moteur jinja2 pour les templates html il fait la correspondance entre les veriavle et le template html car python ne connait pas le html 
import os #pour accéder au variavle d'environnemnt .env 
from datetime import datetime  #pour la création en temps réél 
from pathlib import Path #pour gérer les chemins de fichier 

#  CHARGER LE .ENV EN PREMIER
from dotenv import load_dotenv
load_dotenv()

# Fonction pour obtenir les variables avec message d'erreur
def get_env_or_error(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise ValueError(f" Variable {key} non trouvée dans .env")
    return value

# Configuration SMTP

try:
    conf = ConnectionConfig(
        MAIL_USERNAME=get_env_or_error("MAIL_USERNAME"),
        MAIL_PASSWORD=get_env_or_error("MAIL_PASSWORD"),
        MAIL_FROM=os.getenv("MAIL_FROM", "noreply@nouvelair.com"),
        MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
        MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
        MAIL_STARTTLS=True, #pour chiffrer la connexion 
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True
    )
    print(f"✅ Configuration email chargée pour {os.getenv('MAIL_USERNAME')}")
except ValueError as e:
    print(str(e))
    print("⚠️ Vérifie que le fichier .env existe dans backend/ et contient MAIL_USERNAME et MAIL_PASSWORD")
    # Configuration par défaut pour éviter le crash
    conf = ConnectionConfig(
        MAIL_USERNAME="",
        MAIL_PASSWORD="",
        MAIL_FROM="noreply@nouvelair.com",
        MAIL_PORT=587,
        MAIL_SERVER="smtp.gmail.com",
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True
    )

# Instance FastMail
fm = FastMail(conf)

async def send_confirmation_email(
    recipient_email: str,
    passenger_name: str,
    token: str,
    category: str,
    created_at: datetime
):
    
    # Vérifier la configuration
    if not os.getenv("MAIL_USERNAME") or not os.getenv("MAIL_PASSWORD"):
        print(" ERREUR: MAIL_USERNAME ou MAIL_PASSWORD non configuré dans .env")
        print(f" Fichier .env attendu : {Path.cwd() / '.env'}")
        return False
    
    try:
        # URL de suivi
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        #cette url sera utilisé dans confirmations email ou le passager clique sur suivre ma réclamation pour suivre 
        tracking_url = f"{frontend_url}/suivi?token={token}"
        
        
        # Charger le template HTML
        template_path = Path(__file__).parent.parent / "templates" / "confirmation_email.html"
        
        if not template_path.exists():
            print(f" Template non trouvé : {template_path}")
            return False
        
        with open(template_path, "r", encoding="utf-8") as f:
            html_template = Template(f.read())
        
        # Remplacer les variables
        html_content = html_template.render(
            passenger_name=passenger_name,
            token=token,
            category=category,
            date_soumission=created_at.strftime("%d/%m/%Y à %H:%M"),
            tracking_url=tracking_url,
            logo_url="https://i.imgur.com/hRKnF8M.png"
        )
        
        # Créer le message
        message = MessageSchema(
            subject=f"Confirmation de votre réclamation #{token}",
            recipients=[recipient_email],
            body=html_content,
            subtype="html"
        )
        
        # Envoyer
        await fm.send_message(message)
        
        print(f"✅ Email envoyé avec succès à {recipient_email}")
        return True
        
    except Exception as e:
        print(f" Erreur lors de l'envoi de l'email : {e}")
        import traceback
        traceback.print_exc()
        return False