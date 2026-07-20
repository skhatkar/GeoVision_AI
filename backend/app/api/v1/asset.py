from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.asset import AssetResponse

from app.services.asset_service import (
    get_assets,
    get_asset,
    delete_asset,
)

router = APIRouter()


# =====================================================
# List Assets by Layer
# =====================================================
@router.get(
    "/layer/{layer_id}",
    response_model=list[AssetResponse],
)
def list_assets(
    layer_id: int,
    db: Session = Depends(get_db),
):

    return get_assets(
        db=db,
        layer_id=layer_id,
    )


# =====================================================
# Get Single Asset
# =====================================================
@router.get(
    "/{asset_id}",
    response_model=AssetResponse,
)
def asset_detail(
    asset_id: int,
    db: Session = Depends(get_db),
):

    asset = get_asset(
        db=db,
        asset_id=asset_id,
    )

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found.",
        )

    return asset


# =====================================================
# Delete Asset
# =====================================================
@router.delete(
    "/{asset_id}",
)
def remove_asset(
    asset_id: int,
    db: Session = Depends(get_db),
):

    asset = get_asset(
        db=db,
        asset_id=asset_id,
    )

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found.",
        )

    delete_asset(
        db=db,
        asset=asset,
    )

    return {
        "message": "Asset deleted successfully."
    }