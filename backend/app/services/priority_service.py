from app.models.reclamation import Priorite, Reclamation

CONTACT_PRIORITY={
    "AVOCAT":3,
    "ASSOCIATION":2,
    "AGENCE_VOYAGE":2,
    "Passager":1,
}
CATEGORY_PRIORITY={
    "REMBOURSEMENT"   : 3,
    "ANNULATION"       : 3,
    "RETARD_VOL"       : 2,
    "BAGAGE"           : 3,
    "SERVICE_AEROPORT" : 1,
    "AUTRE"            : 1,
}
def calculate_priority(type_contact:str, category:str)-> Priorite:
    score_contact=CONTACT_PRIORITY.get(type_contact.upper(),1)
    score_category=CATEGORY_PRIORITY.get(category.upper(),1)

    total = score_contact + score_category
    print(f"Score priorite : contact={score_contact} + category={score_category} = {total}")

    if total >=5:
        return Priorite.ELEVEE
    elif total >=3:
        return Priorite.MOYENNE
    else:
        return Priorite.NORMALE