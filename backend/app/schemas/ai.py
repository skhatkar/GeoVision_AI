from pydantic import BaseModel
from typing import List, Optional


class LayerSummaryResponse(BaseModel):
    layer_id: int
    layer_name: str
    geometry_type: str
    feature_count: int
    crs: str
    dataset_name: Optional[str]
    department_name: Optional[str]
    summary: str


class DatasetSummaryResponse(BaseModel):
    dataset_id: int
    dataset_name: str
    total_layers: int
    total_assets: int
    geometry_type: Optional[str]
    crs: Optional[str]
    summary: str


class ProjectSummaryResponse(BaseModel):
    project_id: int
    project_name: str
    total_datasets: int
    total_layers: int
    total_assets: int
    summary: str


class LayerHealthResponse(BaseModel):
    layer_id: int
    health_score: float
    grade: str
    status: str


class DataQualityResponse(BaseModel):
    layer_id: int
    total_assets: int
    missing_geometry: int
    duplicate_assets: int
    invalid_coordinates: int
    attribute_completeness: float
    quality_score: float


class DuplicateAsset(BaseModel):
    asset_id: int
    name: Optional[str]
    duplicate_count: int


class DuplicateResponse(BaseModel):
    total_duplicates: int
    duplicates: List[DuplicateAsset]


class MissingGeometryAsset(BaseModel):
    asset_id: int
    name: Optional[str]


class MissingGeometryResponse(BaseModel):
    total_missing: int
    assets: List[MissingGeometryAsset]


class InvalidCoordinateAsset(BaseModel):
    asset_id: int
    name: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]


class InvalidCoordinateResponse(BaseModel):
    total_invalid: int
    assets: List[InvalidCoordinateAsset]


class CRSCheckResponse(BaseModel):
    layer_id: int
    crs: str
    valid: bool
    recommendation: str


class AttributeCompletenessResponse(BaseModel):
    layer_id: int
    completeness_percentage: float
    missing_attributes: List[str]