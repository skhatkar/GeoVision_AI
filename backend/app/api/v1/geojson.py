from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.geojson_service import layer_to_geojson

router = APIRouter()


@router.get("/layer/{layer_id}")
def get_geojson(
    layer_id: int,
    db: Session = Depends(get_db),
):
    return layer_to_geojson(
        db=db,
        layer_id=layer_id,
    )