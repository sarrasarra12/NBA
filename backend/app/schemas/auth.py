#ce fichier permet de définir de qui entre et ce qui sort
#ce que le client envoi lors du login (loginequest)
#ce que le serveur retourne (token response , agentResponse)
from pydantic import BaseModel, EmailStr
#emailstr = valide format du email
#basemodel : clase mere pour tous les schema
from typing import Optional 
class LoginRequest(BaseModel):
    email:EmailStr
    password:str
class TokenResponse(BaseModel):
    #donnée retourner aprés login 
    access_token : str 
    token_type:str="Bearer"# c type de token
    role :str
    departement:Optional[str] = None #si le client n'a pas de departement , il est nul
    nom : str 
#profil de l'agent connecté 
class AgentMe(BaseModel):
    #retourné par get/api/auth/me
    id: int 
    nom : str
    email : str
    role: str
    departement : Optional[str] #none si admin
class Config:
    SQLALchemy = True
# permet de convertir un objet SQLAlchemy → schema pydantic


#--------------------Partie Admin----------------
# Données pour créer un agent
class AgentCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    password: str
    departement: Optional[str] = None
    # BAGAGE, CALL_CENTRE, SERVICE_CLIENT ou None pour ADMIN
#schema pour le département
class DepartementInfo(BaseModel):
    id  : int
    nom : str
    class Config:
        from_attributes = True
# Données retournées pour un agent
class AgentResponse(BaseModel):
    id: int
    nom: str
    prenom: str
    email: str
    role: str
    departement  : Optional[DepartementInfo] = None  
    is_active: bool

    class Config:
        from_attributes = True


