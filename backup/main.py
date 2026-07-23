from fastapi import FastAPI

from app.api.v1.auth import router as auth_router
from app.api.v1.projects import router as project_router

from app.api.v1.dataset import router as dataset_router

from app.api.v1.layer import router as layer_router
from app.api.v1.asset import router as asset_router

from app.api.v1.geojson import router as geojson_router
from app.api.v1.map import router as map_router

from app.api.v1.analysis import router as analysis_router
from app.api.v1.department import router as department_router

from app.api.v1.dashboard import router as dashboard_router

from app.api.v1.analytics import router as analytics_router

from app.api.v1.ai import router as ai_router


app = FastAPI(
    title="GeoVision AI",
    version="1.0.0",
)


app.include_router(dataset_router)


app.include_router(
    department_router,
    prefix="/departments",
    tags=["Departments"],
)


app.include_router(auth_router)

app.include_router(project_router)

app.include_router(layer_router)


app.include_router(
    asset_router
)


app.include_router(
    geojson_router,
    prefix="/geojson",
    tags=["GeoJSON"],
)


app.include_router(
    map_router,
    prefix="/map",
    tags=["Map"],
)


app.include_router(
    analysis_router,
    prefix="/analysis",
    tags=["Analysis"],
)

app.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"],
)

app.include_router(
    analytics_router,
    prefix="/analytics",
    tags=["Analytics"],
)

app.include_router(
    ai_router,
    prefix="/ai",
    tags=["AI"],
)

@app.get("/")
def home():

    return {
        "message": "GeoVision AI Backend Running"
    }