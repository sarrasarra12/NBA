# app/models/piece_jointe.py

"""
MODEL PIECE JOINTE
Selon ton diagramme de classe
"""

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class PieceJointe(Base):
   
    
    __tablename__ = "pieces_jointes"
    
   
    id = Column(Integer, primary_key=True, index=True)
    # Correspond à : idPiece
    
    reclamation_id = Column(Integer, ForeignKey("reclamations.id"), nullable=False)
    # Relation vers reclamation
    
    nom_fichier = Column(String(255), nullable=False)
    # Correspond à : nomFichier
    # Exemple : "bagage_endommage.jpg"
    
    type_fichier = Column(String(50), nullable=False)
    # Correspond à : typeFichier
    # Exemple : "image/jpeg", "image/png"
    
    url_stockage = Column(String(500), nullable=False)
    # Correspond à : urlStockage
    # URL MinIO : "https://minio.example.com/pieces/abc123.jpg"
    
    
    # ────────────────────────────────────────────────────
    # RELATION
    # ────────────────────────────────────────────────────
    
    reclamation = relationship("Reclamation", back_populates="pieces_jointes")
    
    
    def __repr__(self):
        return f"<PieceJointe(id={self.id}, nom={self.nom_fichier})>"