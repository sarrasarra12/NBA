from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.file_storage import init_minio
from app.routers import claims
from contextlib import asynccontextmanager
from app.services.ocr_service import init_ocr
from app.services.gemma_service import init_gemma
from app.seeds.seed_departements import seed_categories_and_departements
from app.seeds.seed_admin import seed_admin
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.agents import router as agent_router
from app.services.rag_service import init_rag
from app.routers.agent_ia import router as agent_ia_router
from app.models.category import Category
from app.models.departement import Departement
from app.routers import classifier_ia
from app.routers import feedback
from app.routers import messages


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Services locaux — ignorés si indisponibles sur Render ──
    try:
        init_minio()
    except Exception as e:
        print(f"⚠️ MinIO non disponible : {e}")
    try:
        init_ocr()
    except Exception as e:
        print(f"⚠️ OCR non disponible : {e}")
    try:
        init_gemma()
    except Exception as e:
        print(f"⚠️ Gemma non disponible : {e}")
    try:
        init_rag()
    except Exception as e:
        print(f"⚠️ RAG non disponible : {e}")

    # ── Seeds — toujours exécutés ──
    seed_categories_and_departements()
    seed_admin()
    yield


# Créer l'application FastAPI
app = FastAPI(
    title="NouvelAir Claims System",
    description="Système de gestion des réclamations",
    version="1.0.0",
    lifespan=lifespan
)

# ── CORS — accepte localhost ET Vercel ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──
app.include_router(claims.router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(agent_router)
app.include_router(agent_ia_router)
app.include_router(classifier_ia.router)
app.include_router(feedback.router)
app.include_router(messages.router)


@app.get("/")
def root():
    return {
        "message": "🚀 API NouvelAir Claims fonctionne !",
        "version": "1.0.0",
        "status": "OK"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "nouvelair-claims-backend"
    }