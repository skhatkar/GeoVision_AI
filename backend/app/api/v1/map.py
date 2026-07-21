from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.map_service import get_layer_geojson

router = APIRouter()


# =====================================================
# Layer GeoJSON
# =====================================================

@router.get(
    "/layer/{layer_id}",
)
def layer_geojson(
    layer_id: int,
    db: Session = Depends(get_db),
):

    geojson = get_layer_geojson(
        db=db,
        layer_id=layer_id,
    )

    if geojson is None:
        raise HTTPException(
            status_code=404,
            detail="Layer not found.",
        )

    return geojson