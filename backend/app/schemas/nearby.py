from pydantic import BaseModel


class NearbyAssetResponse(BaseModel):
    id: int
    name: str | None
    layer_id: int
    distance_m: float

    class Config:
        from_attributes = True