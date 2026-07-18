from pydantic import BaseModel
from typing import Optional


class DatasetResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    filename: str
    file_type: str

    geometry_type: Optional[str] = None
    crs: Optional[str] = None
    feature_count: int

    file_path: str

    project_id: int

    class Config:
        from_attributes = True