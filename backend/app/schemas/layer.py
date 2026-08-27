from datetime import datetime

from pydantic import BaseModel


class LayerUpdate(BaseModel):

    name: str | None = None

    geometry_type: str | None = None

    crs: str | None = None



class LayerResponse(BaseModel):

    id: int

    name: str

    geometry_type: str | None = None

    crs: str | None = None

    feature_count: int = 0

    file_path: str | None = None

    dataset_id: int

    department_id: int

    project_id: int | None = None

    project_name: str | None = None

    created_at: datetime

    updated_at: datetime


    class Config:
        from_attributes = True