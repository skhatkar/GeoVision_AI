from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.layer import (
    LayerResponse,
    LayerUpdate,
)

from app.services.layer_service import (

    get_layers,
    get_layer,
    delete_layer,

    get_dataset_layers,
    get_department_layers,
    update_layer,
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


@router.get(
    "/dataset/{dataset_id}",
    response_model=list[LayerResponse],
)
def dataset_layers(
    dataset_id:int,
    db:Session=Depends(get_db),
):

    return get_dataset_layers(
        db,
        dataset_id
    )



@router.get(
    "/department/{department_id}",
    response_model=list[LayerResponse],
)
def department_layers(
    department_id:int,
    db:Session=Depends(get_db),
):

    return get_department_layers(
        db,
        department_id
    )



@router.patch(
    "/{layer_id}",
    response_model=LayerResponse,
)
def edit_layer(
    layer_id:int,
    data:LayerUpdate,
    db:Session=Depends(get_db),
):

    layer=get_layer(
        db,
        layer_id
    )


    if layer is None:

        raise HTTPException(
            status_code=404,
            detail="Layer not found",
        )


    return update_layer(
        db,
        layer,
        data
    )



@router.get(
    "/{layer_id}/assets"
)
def layer_assets(
    layer_id:int,
    db:Session=Depends(get_db),
):

    layer=get_layer(
        db,
        layer_id
    )


    if layer is None:

        raise HTTPException(
            status_code=404,
            detail="Layer not found"
        )


    return {
        "layer_id":layer.id,
        "asset_count":len(layer.assets),
        "assets":layer.assets
    }