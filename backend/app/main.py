from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.file_storage import init_minio, upload_logo
from app.routers import claims
from contextlib import asynccontextmanager
from app.services.ocr_service import init_ocr
from app.services.gemma_service import init_gemma
from app.services.amadeus_service import init_amadeus
from app.seeds.seed_dept import seed_departements
from app.seeds.seed_agent import seed_agents
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialisation de MinIO
    init_minio()
    upload_logo()
    init_ocr()
    init_gemma()
    init_amadeus()
    seed_departements()  
    seed_agents()
    yield

# Créer l'application FastAPI
app = FastAPI(
    title="NouvelAir Claims System",
    description="Système de gestion des réclamations",
    version="1.0.0",
    lifespan=lifespan
)
@app.on_event("startup")
async def startup():
    seed_departements()  
    seed_agents()

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Router Claims
app.include_router(claims.router)
app.include_router(auth_router)
app.include_router(admin_router)

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