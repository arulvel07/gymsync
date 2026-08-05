"""Smart Campus Gym Management System — FastAPI Application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routes import attendance, analytics, admin, planner

app = FastAPI(
    title="Campus Gym API",
    description="Smart Campus Gym Management System for IIITDM Kancheepuram",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend origins
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(attendance.router)
app.include_router(analytics.router)
app.include_router(admin.router)
app.include_router(planner.router)


@app.get("/", tags=["health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Campus Gym API",
        "version": "1.0.0",
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Detailed health check."""
    from app.database import get_supabase
    try:
        db = get_supabase()
        db.table("gym_config").select("id").limit(1).execute()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
    }
