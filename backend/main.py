import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.services import router as services_router
from routes.scholarships import router as scholarships_router
from routes.grievances import router as grievances_router
from routes.portal import router as portal_router
from services.grievance_store import seed_sample_tickets

load_dotenv()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    seed_sample_tickets()
    yield


app = FastAPI(
    title="SevaSathi AI",
    description="Integrated backend for SevaSathi AI Student Portal: SmartScholar matching engine, multilingual service assistant, grievance tracker, and campus SOS.",
    version="1.1.0",
    lifespan=lifespan,
)

default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:5500",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5500",
]
extra_origins = [
    o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=default_origins + extra_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to SevaSathi AI",
        "status": "Backend is running",
        "try": [
            "/api/health",
            "/api/services/",
            "/api/scholarships/",
            "/api/grievances/",
            "/docs"
        ]
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "SevaSathi AI API",
        "version": "1.1.0",
        "modules": {
            "services": "available",
            "scholarships": "available",
            "grievances": "available",
            "notices": "available",
            "opportunities": "available",
            "sos": "available"
        },
        "recommended_port": 5000
    }


app.include_router(services_router, prefix="/api/services")
app.include_router(scholarships_router, prefix="/api/scholarships")
app.include_router(grievances_router, prefix="/api/grievances")
app.include_router(portal_router, prefix="/api")
