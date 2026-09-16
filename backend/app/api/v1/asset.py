from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.asset import (
    AssetResponse,
    AssetUpdate,
)

from app.services.asset_service import (
    get_assets,
    get_all_assets,
    get_asset,
    delete_asset,
    get_assets_geojson,
    get_nearby_assets,
    search_assets,
    update_asset,
)


from app.services.hierarchy_service import (
    get_administrative_hierarchy,
    filter_assets_by_hierarchy,
)


router = APIRouter(
    prefix="/assets",
    tags=["Assets"],
)


# =====================================================
# Administrative Hierarchy (District > Block > Panchayat)
# =====================================================

@router.get(
    "/hierarchy"
)
def get_hierarchy(
    db: Session = Depends(get_db),
):
    return get_administrative_hierarchy(db)


# =====================================================
# Filter Assets by District / Block / Panchayat / Dept
# =====================================================

@router.get(
    "/filter"
)
def filter_assets(
    district: str | None = None,
    block: str | None = None,
    panchayat: str | None = None,
    department: str | None = None,
    db: Session = Depends(get_db),
):
    return filter_assets_by_hierarchy(
        db=db,
        district=district,
        block=block,
        panchayat=panchayat,
        department=department,
    )


# =====================================================
# List All Assets
# =====================================================

@router.get(
    "",
    response_model=list[AssetResponse],
)
def list_all_assets(
    db: Session = Depends(get_db),
):

    return get_all_assets(db)



# =====================================================
# GeoJSON Layer
# =====================================================

@router.get(
    "/layer/{layer_id}/geojson"
)
def layer_geojson(
    layer_id: int,
    db: Session = Depends(get_db),
):

    return get_assets_geojson(
        db,
        layer_id,
    )



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
# Nearby Assets
# =====================================================

@router.get(
    "/nearby",
    response_model=list,
)
def nearby_assets(
    latitude: float,
    longitude: float,
    radius: float = 5000,
    db: Session = Depends(get_db),
):

    return get_nearby_assets(
        db=db,
        latitude=latitude,
        longitude=longitude,
        radius=radius,
    )



# =====================================================
# Search Assets
# =====================================================

@router.get(
    "/search"
)
def search_asset_api(
    field: str,
    value: str,
    db: Session = Depends(get_db),
):

    return search_assets(
        db,
        field,
        value,
    )



# =====================================================
# Update Asset
# =====================================================

@router.patch(
    "/{asset_id}",
    response_model=AssetResponse,
)
def edit_asset(
    asset_id: int,
    data: AssetUpdate,
    db: Session = Depends(get_db),
):

    asset = get_asset(
        db,
        asset_id,
    )


    if asset is None:

        raise HTTPException(
            status_code=404,
            detail="Asset not found.",
        )


    return update_asset(
        db=db,
        asset=asset,
        name=data.name,
        attributes=data.attributes,
    )



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