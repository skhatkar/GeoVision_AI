from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.layer import LayerResponse

from app.services.layer_service import (
    get_layers,
    get_layer,
    delete_layer,
)

router = APIRouter(
    prefix="/layers",
    tags=["Layers"],
)


@router.get(
    "",
    response_model=list[LayerResponse],
)
def list_layers(
    db: Session = Depends(get_db),
):
    return get_layers(db)


@router.get(
    "/{layer_id}",
    response_model=LayerResponse,
)
def layer_detail(
    layer_id: int,
    db: Session = Depends(get_db),
):
    layer = get_layer(db, layer_id)

    if layer is None:
        raise HTTPException(
            status_code=404,
            detail="Layer not found",
        )

    return layer


@router.delete(
    "/{layer_id}",
)
def remove_layer(
    layer_id: int,
    db: Session = Depends(get_db),
):
    layer = get_layer(db, layer_id)

    if layer is None:
        raise HTTPException(
            status_code=404,
            detail="Layer not found",
        )

    delete_layer(
        db,
        layer,
    )

    return {
        "message": "Layer deleted successfully."
    }