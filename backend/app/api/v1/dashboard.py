from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.services.dashboard_service import (
    get_dashboard_summary,
    get_recent_projects,
    get_recent_datasets,
    get_recent_layers,
    get_recent_assets,
    get_storage_summary,
    get_geometry_summary,
    get_dashboard_statistics,
)

router = APIRouter()


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
):
    return get_dashboard_summary(db)


@router.get("/recent-projects")
def recent_projects(
    db: Session = Depends(get_db),
):
    return get_recent_projects(db)


@router.get("/recent-datasets")
def recent_datasets(
    db: Session = Depends(get_db),
):
    return get_recent_datasets(db)


@router.get("/recent-layers")
def recent_layers(
    db: Session = Depends(get_db),
):
    return get_recent_layers(db)


@router.get("/recent-assets")
def recent_assets(
    db: Session = Depends(get_db),
):
    return get_recent_assets(db)


@router.get("/storage")
def storage(
    db: Session = Depends(get_db),
):
    return get_storage_summary(db)


@router.get("/geometry-summary")
def geometry_summary(
    db: Session = Depends(get_db),
):
    return get_geometry_summary(db)


@router.get("/statistics")
def statistics(
    db: Session = Depends(get_db),
):
    return get_dashboard_statistics(db)