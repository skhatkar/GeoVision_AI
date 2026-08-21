from pydantic import BaseModel


# ============================================================
# DASHBOARD SUMMARY
# ============================================================

class DashboardSummary(BaseModel):
    total_projects: int
    total_datasets: int
    total_layers: int
    total_assets: int
    total_departments: int


# ============================================================
# STORAGE
# ============================================================

class StorageSummary(BaseModel):
    total_size_mb: float
    total_files: int


# ============================================================
# GEOMETRY
# ============================================================

class GeometrySummary(BaseModel):
    point_layers: int
    line_layers: int
    polygon_layers: int


# ============================================================
# DASHBOARD STATISTICS
# ============================================================

class DashboardStatistics(BaseModel):
    projects: int
    datasets: int
    layers: int
    assets: int


# ============================================================
# ASSET DISTRIBUTION
# ============================================================

class AssetDistributionItem(BaseModel):
    name: str
    value: int