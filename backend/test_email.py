import asyncio
import os
from dotenv import load_dotenv
from app.services.email_service import send_confirmation_email
from datetime import datetime

# Charger le .env
load_dotenv()

async def test():
    print("=" * 50)
    print("🔄 TEST D'ENVOI D'EMAIL")
    print("=" * 50)
    print()
    
    # Vérifier la configuration
    mail_user = os.getenv('MAIL_USERNAME')
    mail_pass = os.getenv('MAIL_PASSWORD')
    
    print(f"📧 Email configuré : {mail_user}")
    print(f"🔑 Mot de passe configuré : {'Oui ✅' if mail_pass else 'Non ❌'}")
    print()
    
    if not mail_user or not mail_pass:
        print("❌ Configuration manquante dans .env")
        print("Vérifie que tu as bien :")
        print("  - MAIL_USERNAME")
        print("  - MAIL_PASSWORD")
        return
    
    # Demander l'email de destination
    print("📬 À quelle adresse veux-tu envoyer le test ?")
    your_email = input("Entre ton email : ")
    
    if not your_email:
        print("❌ Aucun email fourni")
        return
    
    print()
    print(f"📤 Envoi d'un email de test à {your_email}...")
    print()
    
    # Envoyer l'email
    try:
        result = await send_confirmation_email(
            recipient_email=your_email,
            passenger_name="Test User",
            token="TEST-123-ABC",
            category="Test Catégorie",
            created_at=datetime.now()
        )
        
        if result:
            print("=" * 50)
            print("✅ EMAIL ENVOYÉ AVEC SUCCÈS !")
            print("=" * 50)
            print()
            print(f"📬 Vérifie ta boîte : {your_email}")
            print("⏱️  L'email peut prendre 5 à 30 secondes pour arriver")
            print("⚠️  Si tu ne le vois pas, regarde dans les SPAMS")
            print()
        else:
            print("❌ Échec de l'envoi")
            print("🔍 Vérifie la configuration dans .env")
            
    except Exception as e:
        print("=" * 50)
        print("❌ ERREUR")
        print("=" * 50)
        print(f"Erreur : {e}")
        print()
        print("💡 Solutions possibles :")
        print("  1. Vérifie que MAIL_PASSWORD est le mot de passe d'APPLICATION")
        print("  2. Vérifie que la validation en deux étapes est activée")
        print("  3. Vérifie qu'il n'y a pas d'espaces en trop dans .env")

# Exécuter le test
if __name__ == "__main__":
    asyncio.run(test())