from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router_v1
from typing import Optional

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production or set via env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router_v1, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": f"Welcome to {settings.APP_NAME}. API available at {settings.API_V1_STR}"}

# Placeholder for startup/shutdown events
@app.on_event("startup")
async def startup_event():
    print(f"{settings.APP_NAME} started.")

@app.on_event("shutdown")
async def shutdown_event():
    print(f"{settings.APP_NAME} shutting down.")