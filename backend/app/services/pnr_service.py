# app/services/pnr_service.py
from sqlalchemy import text #ecrire du sql brut
from sqlalchemy.orm import Session #session est un objet qui permet d'envoyer et recevoir des requette
from typing import Dict #retourne dict pour lisibilité du code 

def verify_pnr(db: Session, pnr_code: str) -> Dict:
    pnr_code = pnr_code.upper().strip()#normalisation du code pnr
    
    try:
        query = text("""
        SELECT 
            pnr_code,           -- result[0]
            flight_number,      -- result[1]
            departure_airport,  -- result[2]
            arrival_airport,    -- result[3]
            departure_date,     -- result[4]
            passenger_name,     -- result[5]
            email               -- result[6]
        FROM reservations
        WHERE pnr_code = :pnr_code
""")            #paramétre nommé (protction contre injection sql) sqlalchemy le remplace en valeur reele 
        
        result = db.execute(query, {"pnr_code": pnr_code}).fetchone()
        #e,voi requette à la base et récupérer une seule ligne (fetchone)
        if result:
            return {
                "success": True,
        "exists": True,
        "pnr_code":          result[0],
        "flight_number":     result[1],
        "departure_airport": result[2],
        "arrival_airport":   result[3],
        "departure_date":    str(result[4]) if result[4] else None,
        "passenger_name":    result[5],  
        "email":             result[6],  
                
            }
        else:
            return {
                "success": False,
                "exists": False,
                "error": f"PNR {pnr_code} introuvable dans notre base"
            }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }#traite tous erreur technique 