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
    get_asset_distribution,
)


router = APIRouter()


# ============================================================
# DASHBOARD SUMMARY
# ============================================================

@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
):
    return get_dashboard_summary(db)


# ============================================================
# RECENT PROJECTS
# ============================================================

@router.get("/recent-projects")
def recent_projects(
    db: Session = Depends(get_db),
):
    return get_recent_projects(db)


# ============================================================
# RECENT DATASETS
# ============================================================

@router.get("/recent-datasets")
def recent_datasets(
    db: Session = Depends(get_db),
):
    return get_recent_datasets(db)


# ============================================================
# RECENT LAYERS
# ============================================================

@router.get("/recent-layers")
def recent_layers(
    db: Session = Depends(get_db),
):
    return get_recent_layers(db)


# ============================================================
# RECENT ASSETS
# ============================================================

@router.get("/recent-assets")
def recent_assets(
    db: Session = Depends(get_db),
):
    return get_recent_assets(db)


# ============================================================
# STORAGE
# ============================================================

@router.get("/storage")
def storage(
    db: Session = Depends(get_db),
):
    return get_storage_summary(db)


# ============================================================
# GEOMETRY SUMMARY
# ============================================================

@router.get("/geometry-summary")
def geometry_summary(
    db: Session = Depends(get_db),
):
    return get_geometry_summary(db)


# ============================================================
# DASHBOARD STATISTICS
# ============================================================

@router.get("/statistics")
def statistics(
    db: Session = Depends(get_db),
):
    return get_dashboard_statistics(db)


# ============================================================
# ASSET DISTRIBUTION
# ============================================================

@router.get("/asset-distribution")
def asset_distribution(
    by: str = "project",
    project_id: int | None = None,
    db: Session = Depends(get_db),
):
    return get_asset_distribution(db, by=by, project_id=project_id)