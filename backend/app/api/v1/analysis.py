from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.services.analysis_service import (
    buffer_analysis,
    intersect_analysis,
    within_analysis,
    contains_analysis,
    touches_analysis,
    crosses_analysis,
    overlaps_analysis,
    nearest_neighbor,
)

router = APIRouter()


@router.post("/buffer")
def create_buffer(
    asset_id: int,
    distance: float,
    db: Session = Depends(get_db),
):
    return buffer_analysis(
        db=db,
        asset_id=asset_id,
        distance=distance,
    )

@router.post("/intersect")
def create_intersect(
    layer1_id: int,
    layer2_id: int,
    db: Session = Depends(get_db),
):
    return intersect_analysis(
        db=db,
        layer1_id=layer1_id,
        layer2_id=layer2_id,
    )

@router.post("/within")
def create_within(
    container_layer_id: int,
    target_layer_id: int,
    db: Session = Depends(get_db),
):
    return within_analysis(
        db=db,
        container_layer_id=container_layer_id,
        target_layer_id=target_layer_id,
    )

@router.post("/contains")
def contains(
    container_layer_id: int,
    target_layer_id: int,
    db: Session = Depends(get_db),
):
    return contains_analysis(
        db=db,
        container_layer_id=container_layer_id,
        target_layer_id=target_layer_id,
    )

@router.post("/touches")
def touches(
    layer1_id:int,
    layer2_id:int,
    db:Session=Depends(get_db),
):
    return touches_analysis(
        db,
        layer1_id,
        layer2_id,
    )

@router.post("/crosses")
def crosses(
    layer1_id:int,
    layer2_id:int,
    db:Session=Depends(get_db),
):
    return crosses_analysis(
        db,
        layer1_id,
        layer2_id,
    )


@router.post("/overlaps")
def overlaps(
    layer1_id:int,
    layer2_id:int,
    db:Session=Depends(get_db),
):
    return overlaps_analysis(
        db,
        layer1_id,
        layer2_id,
    )


@router.get("/nearest")
def nearest(
    latitude:float,
    longitude:float,
    limit:int=10,
    db:Session=Depends(get_db),
):
    return nearest_neighbor(
        db,
        latitude,
        longitude,
        limit,
    )