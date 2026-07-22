from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_projects: int
    total_datasets: int
    total_layers: int
    total_assets: int
    total_departments: int


class StorageSummary(BaseModel):
    total_size_mb: float
    total_files: int


class GeometrySummary(BaseModel):
    point_layers: int
    line_layers: int
    polygon_layers: int


class ActivityItem(BaseModel):
    id: int
    name: str
    created_at: str


class DashboardStatistics(BaseModel):
    projects: int
    datasets: int
    layers: int
    assets: int