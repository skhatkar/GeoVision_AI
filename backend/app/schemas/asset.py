from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, field_serializer


class AssetResponse(BaseModel):
    id: int
    name: str | None
    geometry: Any
    attributes: dict
    layer_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("geometry")
    def serialize_geometry(self, geometry):
        if geometry is None:
            return None
        return str(geometry)
    

class AssetUpdate(BaseModel):

    name: str | None = None

    attributes: dict | None = None