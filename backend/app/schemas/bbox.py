from pydantic import BaseModel


class BBoxAssetResponse(BaseModel):
    id: int
    name: str | None
    geometry: str
    layer_id: int

    class Config:
        from_attributes = True