from datetime import datetime

from pydantic import BaseModel


class LayerResponse(BaseModel):
    id: int
    name: str
    geometry_type: str | None
    crs: str | None
    feature_count: int
    file_path: str
    dataset_id: int
    department_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True