from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.services.analytics_service import (
    assets_by_layer,
    assets_by_department,
    assets_by_geometry,
    project_progress,
    upload_trends,
    storage_usage,
    top_layers,
    top_projects,
)

router = APIRouter()


@router.get("/assets-by-layer")
def get_assets_by_layer(
    db: Session = Depends(get_db),
):
    return assets_by_layer(db)


@router.get("/assets-by-department")
def get_assets_by_department(
    db: Session = Depends(get_db),
):
    return assets_by_department(db)


@router.get("/assets-by-geometry")
def get_assets_by_geometry(
    db: Session = Depends(get_db),
):
    return assets_by_geometry(db)


@router.get("/project-progress")
def get_project_progress(
    db: Session = Depends(get_db),
):
    return project_progress(db)


@router.get("/upload-trends")
def get_upload_trends(
    db: Session = Depends(get_db),
):
    return upload_trends(db)


@router.get("/storage-usage")
def get_storage_usage(
    db: Session = Depends(get_db),
):
    return storage_usage(db)


@router.get("/top-layers")
def get_top_layers(
    db: Session = Depends(get_db),
):
    return top_layers(db)


@router.get("/top-projects")
def get_top_projects(
    db: Session = Depends(get_db),
):
    return top_projects(db)