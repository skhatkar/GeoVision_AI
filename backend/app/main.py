from fastapi import FastAPI

from app.api.v1.auth import router as auth_router
from app.api.v1.projects import router as project_router

from app.api.v1.dataset import router as dataset_router

app = FastAPI(
    title="GeoVision AI",
    version="1.0.0",
)

app.include_router(dataset_router)

app.include_router(auth_router)
app.include_router(project_router)


@app.get("/")
def home():
    return {
        "message": "GeoVision AI Backend Running"
    }