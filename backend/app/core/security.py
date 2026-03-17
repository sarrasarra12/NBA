#passlib=bibliothéque de hashage de mots de passe
from passlib.context import CryptContext
from jose import JWTError , jwt
#jose = bibliothéque JWT 
#JWTError = exception levée si token invalide
#jwt = objet principal pour crée/décoder les tokens 
from datetime import datetime , timedelta
import os #os pour variable d'env (.env)
#--------------Configuration BCRYPT
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    #schema= liste des algo autorisé
    #bcrypt = algo choisi 
    deprecated="auto"

)
#--------------configuration JWT
#os.getenv = lire variable secret key depuis .env
SECRET_KEY = os.getenv ("SECRET_KEY", "nouvelair_secret_2024")
ALGORITHM ="HS256"
#algo de signature de token 
#algo jwt le plus utilisé 
ACCESS_TOKEN_EXPIRE =24
#24 heure -> token expiré -> agent doit se reconnecter

#-----------------fONCTION
def hash_password(password : str) -> str:
# appliquer bcrypt sur pwd
    return pwd_context.hash(password)

def verify_password(plain :str , hashed : str)-> bool :
#plain : pwd saisi lors du login et hashed: hash stocké en DSS return true si correcte
    return pwd_context.verify(plain , hashed)


def create_token (data : dict)-> str :
    payload = data.copy()#copier données pour ne pas modifier dict original
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE)
    payload.update({"exp":expire})
    #crée le token signé 
    return jwt.encode(payload , SECRET_KEY , algorithm=ALGORITHM)
def decode_token(token : str) -> dict : 
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        #jwt.decode() -> vérifier le signature et décoder 
        #vérifier token n'a pas été modifié
        #vérifier auto l'expiration
    except JWTError:
        return None
    #jwtError levée si :
    #token modifier/falsifié
    #token malformé 
def hash_password(password: str) -> str:
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    # bcrypt limite à 72 bytes maximum
    return pwd_context.hash(password)

#----
#bcrypt : pour les mot de passe
#JWT : pour les tokens 