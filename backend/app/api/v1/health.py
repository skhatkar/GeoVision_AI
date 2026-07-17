from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    return {
        "status": "healthy",
        "application": "GeoVision AI",
        "version": "1.0.0"
    }