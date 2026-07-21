from datetime import datetime

from pydantic import BaseModel


class DatasetCreate(BaseModel):
    name: str
    description: str | None = None
    source: str | None = None
    project_id: int

    file_name: str
    file_path: str
    file_type: str

    geometry_type: str | None = None
    crs: str | None = None
    feature_count: int = 0


class DatasetUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    source: str | None = None


class DatasetResponse(BaseModel):

    id: int

    name: str
    description: str | None

    source: str | None

    file_name: str
    file_path: str
    file_type: str

    geometry_type: str | None
    crs: str | None

    feature_count: int

    project_id: int

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DatasetListResponse(BaseModel):

    id: int
    name: str
    file_type: str
    geometry_type: str | None
    feature_count: int
    project_id: int
    created_at: datetime


    class Config:
        from_attributes = True