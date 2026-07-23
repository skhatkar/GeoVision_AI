from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.ai import (
    LayerSummaryResponse,
    DatasetSummaryResponse,
    ProjectSummaryResponse,
    LayerHealthResponse,
    DataQualityResponse,
    DuplicateResponse,
    MissingGeometryResponse,
    InvalidCoordinateResponse,
    CRSCheckResponse,
    AttributeCompletenessResponse,
)

from app.services.ai_service import (
    get_layer_summary,
    get_dataset_summary,
    get_project_summary,
    get_layer_health,
    get_data_quality,
    get_duplicate_assets,
    get_missing_geometry,
    get_invalid_coordinates,
    get_crs_check,
    get_attribute_completeness,
)

router = APIRouter()

# ==========================================================
# Layer Summary
# ==========================================================

@router.get(
    "/layer-summary/{layer_id}",
    response_model=LayerSummaryResponse,
)
def layer_summary(
    layer_id: int,
    db: Session = Depends(get_db),
):
    return get_layer_summary(db, layer_id)


# ==========================================================
# Dataset Summary
# ==========================================================

@router.get(
    "/dataset-summary/{dataset_id}",
    response_model=DatasetSummaryResponse,
)
def dataset_summary(
    dataset_id: int,
    db: Session = Depends(get_db),
):
    return get_dataset_summary(db, dataset_id)


# ==========================================================
# Project Summary
# ==========================================================

@router.get(
    "/project-summary/{project_id}",
    response_model=ProjectSummaryResponse,
)
def project_summary(
    project_id: int,
    db: Session = Depends(get_db),
):
    return get_project_summary(db, project_id)


# ==========================================================
# Layer Health
# ==========================================================

@router.get(
    "/layer-health/{layer_id}",
    response_model=LayerHealthResponse,
)
def layer_health(
    layer_id: int,
    db: Session = Depends(get_db),
):
    return get_layer_health(db, layer_id)


# ==========================================================
# Data Quality
# ==========================================================

@router.get(
    "/data-quality/{layer_id}",
    response_model=DataQualityResponse,
)
def data_quality(
    layer_id: int,
    db: Session = Depends(get_db),
):
    return get_data_quality(db, layer_id)


# ==========================================================
# Duplicate Assets
# ==========================================================

@router.get(
    "/duplicate-assets/{layer_id}",
    response_model=DuplicateResponse,
)
def duplicate_assets(
    layer_id: int,
    db: Session = Depends(get_db),
):
    return get_duplicate_assets(db, layer_id)


# ==========================================================
# Missing Geometry
# ==========================================================

@router.get(
    "/missing-geometry/{layer_id}",
    response_model=MissingGeometryResponse,
)
def missing_geometry(
    layer_id: int,
    db: Session = Depends(get_db),
):
    return get_missing_geometry(db, layer_id)


# ==========================================================
# Invalid Coordinates
# ==========================================================

@router.get(
    "/invalid-coordinates/{layer_id}",
    response_model=InvalidCoordinateResponse,
)
def invalid_coordinates(
    layer_id: int,
    db: Session = Depends(get_db),
):
    return get_invalid_coordinates(db, layer_id)


# ==========================================================
# CRS Check
# ==========================================================

@router.get(
    "/crs-check/{layer_id}",
    response_model=CRSCheckResponse,
)
def crs_check(
    layer_id: int,
    db: Session = Depends(get_db),
):
    return get_crs_check(db, layer_id)


# ==========================================================
# Attribute Completeness
# ==========================================================

@router.get(
    "/attribute-completeness/{layer_id}",
    response_model=AttributeCompletenessResponse,
)
def attribute_completeness(
    layer_id: int,
    db: Session = Depends(get_db),
):
    return get_attribute_completeness(db, layer_id)