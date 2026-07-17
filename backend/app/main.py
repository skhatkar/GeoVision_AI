from fastapi import FastAPI

from app.api.v1.health import router as health_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.include_router(
    health_router,
    prefix=settings.API_PREFIX
)


@app.get("/")
def root():
    return {
        "message": "Welcome to GeoVision AI",
        "version": settings.APP_VERSION
    }