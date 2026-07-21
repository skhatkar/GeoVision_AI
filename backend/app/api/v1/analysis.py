from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.services.analysis_service import (

    # Existing spatial analysis
    buffer_analysis,
    intersect_analysis,
    within_analysis,
    contains_analysis,
    touches_analysis,
    crosses_analysis,
    overlaps_analysis,
    nearest_neighbor,

    # Geometry analysis
    centroid_analysis,
    convex_hull_analysis,
    bbox_analysis,
    area_analysis,
    length_analysis,

    # Advanced GIS analysis
    clip_analysis,
    union_analysis,
    difference_analysis,
    dissolve_analysis,
    spatial_join_analysis,
    multi_buffer_analysis,
    heatmap_analysis,
    density_analysis,
    kmeans_analysis,
)


router = APIRouter()



# =====================================================
# BUFFER
# =====================================================

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



# =====================================================
# INTERSECT
# =====================================================

@router.post("/intersect")
def create_intersect(
    layer1_id:int,
    layer2_id:int,
    db:Session=Depends(get_db),
):

    return intersect_analysis(
        db,
        layer1_id,
        layer2_id,
    )



# =====================================================
# WITHIN
# =====================================================

@router.post("/within")
def create_within(
    container_layer_id:int,
    target_layer_id:int,
    db:Session=Depends(get_db),
):

    return within_analysis(
        db,
        container_layer_id,
        target_layer_id,
    )



# =====================================================
# CONTAINS
# =====================================================

@router.post("/contains")
def contains(
    container_layer_id:int,
    target_layer_id:int,
    db:Session=Depends(get_db),
):

    return contains_analysis(
        db,
        container_layer_id,
        target_layer_id,
    )



# =====================================================
# TOUCHES
# =====================================================

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



# =====================================================
# CROSSES
# =====================================================

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



# =====================================================
# OVERLAPS
# =====================================================

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



# =====================================================
# NEAREST
# =====================================================

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



# =====================================================
# CENTROID
# =====================================================

@router.get("/centroid/{layer_id}")
def centroid(
    layer_id:int,
    db:Session=Depends(get_db),
):

    return centroid_analysis(
        db,
        layer_id,
    )



# =====================================================
# CONVEX HULL
# =====================================================

@router.get("/convex-hull/{layer_id}")
def convex_hull(
    layer_id:int,
    db:Session=Depends(get_db),
):

    return convex_hull_analysis(
        db,
        layer_id,
    )



# =====================================================
# BOUNDING BOX
# =====================================================

@router.get("/bbox/{layer_id}")
def bbox(
    layer_id:int,
    db:Session=Depends(get_db),
):

    return bbox_analysis(
        db,
        layer_id,
    )



# =====================================================
# AREA
# =====================================================

@router.get("/area/{layer_id}")
def area(
    layer_id:int,
    db:Session=Depends(get_db),
):

    return area_analysis(
        db,
        layer_id,
    )



# =====================================================
# LENGTH
# =====================================================

@router.get("/length/{layer_id}")
def length(
    layer_id:int,
    db:Session=Depends(get_db),
):

    return length_analysis(
        db,
        layer_id,
    )



# =====================================================
# CLIP
# =====================================================

@router.post("/clip")
def clip(
    input_layer_id:int,
    clip_layer_id:int,
    db:Session=Depends(get_db),
):

    return clip_analysis(
        db,
        input_layer_id,
        clip_layer_id,
    )



# =====================================================
# UNION
# =====================================================

@router.post("/union/{layer_id}")
def union(
    layer_id:int,
    db:Session=Depends(get_db),
):

    return union_analysis(
        db,
        layer_id,
    )



# =====================================================
# DIFFERENCE
# =====================================================

@router.post("/difference")
def difference(
    layer1_id:int,
    layer2_id:int,
    db:Session=Depends(get_db),
):

    return difference_analysis(
        db,
        layer1_id,
        layer2_id,
    )



# =====================================================
# DISSOLVE
# =====================================================

@router.post("/dissolve")
def dissolve(
    layer_id:int,
    field:str,
    db:Session=Depends(get_db),
):

    return dissolve_analysis(
        db,
        layer_id,
        field,
    )



# =====================================================
# SPATIAL JOIN
# =====================================================

@router.post("/spatial-join")
def spatial_join(
    target_layer_id:int,
    join_layer_id:int,
    db:Session=Depends(get_db),
):

    return spatial_join_analysis(
        db,
        target_layer_id,
        join_layer_id,
    )



# =====================================================
# MULTI BUFFER
# =====================================================

@router.post("/multi-buffer")
def multi_buffer(
    layer_id:int,
    distance:float,
    db:Session=Depends(get_db),
):

    return multi_buffer_analysis(
        db,
        layer_id,
        distance,
    )



# =====================================================
# HEATMAP
# =====================================================

@router.get("/heatmap/{layer_id}")
def heatmap(
    layer_id:int,
    db:Session=Depends(get_db),
):

    return heatmap_analysis(
        db,
        layer_id,
    )



# =====================================================
# DENSITY
# =====================================================

@router.get("/density/{layer_id}")
def density(
    layer_id:int,
    db:Session=Depends(get_db),
):

    return density_analysis(
        db,
        layer_id,
    )



# =====================================================
# KMEANS CLUSTERING
# =====================================================

@router.get("/kmeans/{layer_id}")
def kmeans(
    layer_id:int,
    clusters:int=5,
    db:Session=Depends(get_db),
):

    return kmeans_analysis(
        db,
        layer_id,
        clusters,
    )