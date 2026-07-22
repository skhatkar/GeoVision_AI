from pydantic import BaseModel


class LayerAnalytics(BaseModel):
    layer_name: str
    asset_count: int


class DepartmentAnalytics(BaseModel):
    department_name: str
    asset_count: int


class GeometryAnalytics(BaseModel):
    geometry_type: str
    layer_count: int


class ProjectAnalytics(BaseModel):
    project_name: str
    dataset_count: int


class UploadTrend(BaseModel):
    month: str
    uploads: int


class StorageAnalytics(BaseModel):
    dataset_name: str
    size_mb: float


class TopLayerAnalytics(BaseModel):
    layer_name: str
    feature_count: int


class TopProjectAnalytics(BaseModel):
    project_name: str
    dataset_count: int