"""
FastAPI application entry point.
"""
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .routers import auth, notebooks, chapters, pages, uploads, ai, ai

app = FastAPI(title="Tactile Notes API", version="1.0.0")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(auth.router,      prefix="/api")
app.include_router(notebooks.router, prefix="/api")
app.include_router(chapters.router,  prefix="/api")
app.include_router(pages.router,     prefix="/api")
app.include_router(uploads.router,   prefix="/api")
app.include_router(ai.router,        prefix="/api")
app.include_router(ai.router,        prefix="/api")

# --- Static file serving for uploads ---
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "ok"}
