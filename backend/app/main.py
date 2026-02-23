from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.file_storage import init_minio
from app.routers import claims
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialisation de MinIO
    init_minio()
    yield

# Créer l'application FastAPI
app = FastAPI(
    title="NouvelAir Claims System",
    description="Système de gestion des réclamations",
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#Router Claims
app.include_router(claims.router)

# Route racine (test)
@app.get("/")
def root():
    return {
        "message": "🚀 API NouvelAir Claims fonctionne !",
        "version": "1.0.0",
        "status": "OK"
    }

# Route health check
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "nouvelair-claims-backend"
    }