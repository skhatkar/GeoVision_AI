from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.audit_service import log_action
from app.common.request_utils import get_client_ip
from app.common.pagination import PaginationParams, PaginatedResponse
from app.core.security import get_optional_user
from app.models.user import User

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
    response_model=PaginatedResponse[LayerResponse],
)
def list_layers(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(),
):
    items, total = get_layers(
        db,
        skip=pagination.skip,
        limit=pagination.limit,
    )
    return PaginatedResponse.create(
        items=items,
        total=total,
        skip=pagination.skip,
        limit=pagination.limit,
    )


@router.get(
    "/{layer_id}",
    response_model=list[LayerResponse] | LayerResponse,
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
    request: Request,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    layer = get_layer(db, layer_id)

    if layer is None:
        raise HTTPException(
            status_code=404,
            detail="Layer not found",
        )

    l_name = layer.name
    l_id = layer.id

    delete_layer(
        db,
        layer,
    )

    ip_address = get_client_ip(request)
    log_action(
        db,
        action="LAYER_DELETE",
        user_id=current_user.id if current_user else None,
        description=f"Deleted layer '{l_name}' (ID: {l_id})",
        entity_type="layer",
        entity_id=l_id,
        ip_address=ip_address,
    )

    return {
        "message": "Layer deleted successfully."
    }


@router.get(
    "/dataset/{dataset_id}",
    response_model=list[LayerResponse],
)
def dataset_layers(
    dataset_id: int,
    db: Session = Depends(get_db),
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
    department_id: int,
    db: Session = Depends(get_db),
):
    return get_department_layers(
        db,
        department_id
    )


@router.put(
    "/{layer_id}",
    response_model=LayerResponse,
)
def edit_layer(
    layer_id: int,
    data: LayerUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    layer = get_layer(
        db,
        layer_id
    )

    if layer is None:
        raise HTTPException(
            status_code=404,
            detail="Layer not found",
        )

    updated = update_layer(
        db,
        layer,
        data
    )

    ip_address = get_client_ip(request)
    log_action(
        db,
        action="LAYER_UPDATE",
        user_id=current_user.id if current_user else None,
        description=f"Updated layer '{updated.name}'",
        entity_type="layer",
        entity_id=updated.id,
        ip_address=ip_address,
    )

    return updated


@router.get(
    "/{layer_id}/assets"
)
def layer_assets(
    layer_id: int,
    db: Session = Depends(get_db),
):
    layer = get_layer(
        db,
        layer_id
    )

    if layer is None:
        raise HTTPException(
            status_code=404,
            detail="Layer not found"
        )

    return {
        "layer_id": layer.id,
        "asset_count": len(layer.assets),
        "assets": layer.assets
    }