import math
from typing import Any

from shapely.geometry.base import BaseGeometry
from shapely.wkt import dumps

from sqlalchemy import text
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement

from app.models.asset import Asset
from app.models.layer import Layer


# =====================================================
# Helpers
# =====================================================

def _clean_value(value: Any):
    """
    Convert pandas / numpy values into JSON-compatible
    Python values for PostgreSQL JSONB.
    """

    if value is None:
        return None

    # Handle NaN / infinity
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None

    # Convert numpy scalar types
    if hasattr(value, "item"):
        try:
            value = value.item()
        except Exception:
            pass

    # Convert timestamps / dates
    if hasattr(value, "isoformat"):
        try:
            return value.isoformat()
        except Exception:
            pass

    # Primitive values
    if isinstance(value, (str, int, float, bool)):
        return value

    # Anything else
    return str(value)


def _clean_attributes(attributes: dict) -> dict:
    """
    Make GeoDataFrame attributes safe for PostgreSQL JSONB.
    """

    cleaned = {}

    for key, value in attributes.items():
        cleaned[str(key)] = _clean_value(value)

    return cleaned


def _get_asset_name(attributes: dict) -> str | None:
    """
    Try to determine a useful asset name from common
    GIS attribute field names.
    """

    possible_fields = [
        "name",
        "Name",
        "NAME",
        "Village",
        "VILLAGE",
        "village",
        "Hospital",
        "HOSPITAL",
        "hospital",
        "School",
        "SCHOOL",
        "school",
        "Road_Name",
        "ROAD_NAME",
        "Road",
        "ROAD",
        "Labs_Name",
        "LABS_NAME",
        "District",
        "DISTRICT",
    ]

    for field in possible_fields:

        if field not in attributes:
            continue

        value = attributes[field]

        if value is None:
            continue

        value = str(value).strip()

        if value:
            return value

    return None


def _geometry_to_wkt(geometry):
    """
    Convert Shapely geometry to GeoAlchemy WKTElement.
    """

    if geometry is None:
        return None

    if not isinstance(geometry, BaseGeometry):
        return None

    if geometry.is_empty:
        return None

    return WKTElement(
        dumps(geometry),
        srid=4326,
    )


# =====================================================
# Create Single Asset
# =====================================================

def create_asset(
    db: Session,
    *,
    layer: Layer,
    geometry,
    attributes: dict,
):

    geometry_element = _geometry_to_wkt(geometry)

    if geometry_element is None:
        raise ValueError(
            "Asset geometry is empty or invalid."
        )

    cleaned_attributes = _clean_attributes(attributes)

    asset = Asset(
        name=_get_asset_name(cleaned_attributes),
        geometry=geometry_element,
        attributes=cleaned_attributes,
        layer_id=layer.id,
    )

    db.add(asset)
    db.commit()
    db.refresh(asset)

    return asset


# =====================================================
# Bulk Create Assets
# =====================================================

def bulk_create_assets(
    db: Session,
    *,
    layer: Layer,
    gdf,
):
    """
    Create one Asset record for every feature in the
    GeoDataFrame.
    """

    print("\n========== bulk_create_assets() started ==========")

    if gdf is None or gdf.empty:
        print("GeoDataFrame is empty.")
        return 0

    print(f"Layer ID       : {layer.id}")
    print(f"Total Features : {len(gdf)}")

    assets = []

    for index, row in gdf.iterrows():

        geometry = row.geometry

        # -----------------------------------------
        # Validate geometry
        # -----------------------------------------

        if geometry is None:
            print(
                f"Skipping feature {index}: geometry is None"
            )
            continue

        if geometry.is_empty:
            print(
                f"Skipping feature {index}: geometry is empty"
            )
            continue

        # -----------------------------------------
        # Attributes
        # -----------------------------------------

        attributes = {}

        for column in gdf.columns:

            if column == "geometry":
                continue

            value = row[column]

            attributes[str(column)] = _clean_value(value)

        attributes = _clean_attributes(attributes)

        # -----------------------------------------
        # Asset name
        # -----------------------------------------

        name = _get_asset_name(attributes)

        print(
            f"Creating Asset #{index + 1} -> {name}"
        )

        # -----------------------------------------
        # Geometry
        # -----------------------------------------

        geometry_element = _geometry_to_wkt(
            geometry
        )

        if geometry_element is None:
            print(
                f"Skipping feature {index}: invalid geometry"
            )
            continue

        # -----------------------------------------
        # Create SQLAlchemy object
        # -----------------------------------------

        asset = Asset(
            name=name,
            geometry=geometry_element,
            attributes=attributes,
            layer_id=layer.id,
        )

        assets.append(asset)

    print(
        f"\nAssets Prepared : {len(assets)}"
    )

    if not assets:
        print(
            "No valid assets to save."
        )
        return 0

    # -----------------------------------------
    # Database transaction
    # -----------------------------------------

    try:

        db.add_all(assets)

        print(
            "Calling commit()..."
        )

        db.commit()

        print(
            "Commit Successful!"
        )

    except Exception as e:

        db.rollback()

        print(
            "\n========== DATABASE ERROR =========="
        )

        print(
            repr(e)
        )

        print(
            "====================================\n"
        )

        raise

    print(
        "========== bulk_create_assets() finished ==========\n"
    )

    return len(assets)


# =====================================================
# Get All Assets
# =====================================================

def get_all_assets(
    db: Session,
):

    return (
        db.query(Asset)
        .order_by(
            Asset.created_at.desc()
        )
        .all()
    )


# =====================================================
# Get Assets By Layer
# =====================================================

def get_assets(
    db: Session,
    layer_id: int,
):

    return (
        db.query(Asset)
        .filter(
            Asset.layer_id == layer_id
        )
        .order_by(
            Asset.created_at.desc()
        )
        .all()
    )


# =====================================================
# Get Single Asset
# =====================================================

def get_asset(
    db: Session,
    asset_id: int,
):

    return (
        db.query(Asset)
        .filter(
            Asset.id == asset_id
        )
        .first()
    )


# =====================================================
# Delete Asset
# =====================================================

def delete_asset(
    db: Session,
    asset: Asset,
):

    try:

        db.delete(asset)
        db.commit()

    except Exception:

        db.rollback()
        raise


# =====================================================
# Nearby Assets
# =====================================================

def get_nearby_assets(
    db,
    *,
    latitude: float,
    longitude: float,
    radius: float,
):

    sql = text(
        """
        SELECT
            id,
            name,
            layer_id,

            ST_Distance(
                geography(geometry),
                geography(
                    ST_SetSRID(
                        ST_Point(:lon, :lat),
                        4326
                    )
                )
            ) AS distance_m

        FROM assets

        WHERE ST_DWithin(
            geography(geometry),
            geography(
                ST_SetSRID(
                    ST_Point(:lon, :lat),
                    4326
                )
            ),
            :radius
        )

        ORDER BY distance_m
        """
    )

    result = db.execute(
        sql,
        {
            "lat": latitude,
            "lon": longitude,
            "radius": radius,
        },
    )

    return result.mappings().all()


# =====================================================
# Search Assets By Attribute
# =====================================================

def search_assets(
    db: Session,
    field: str,
    value: str,
):

    sql = text(
        """
        SELECT
            id,
            name,
            layer_id,
            attributes
        FROM assets
        WHERE attributes ->> :field ILIKE :value
        """
    )

    result = db.execute(
        sql,
        {
            "field": field,
            "value": f"%{value}%",
        },
    )

    return result.mappings().all()


# =====================================================
# Update Asset
# =====================================================

def update_asset(
    db: Session,
    asset: Asset,
    *,
    name: str | None,
    attributes: dict | None,
):

    if name is not None:
        asset.name = name

    if attributes is not None:
        asset.attributes = _clean_attributes(
            attributes
        )

    try:

        db.commit()
        db.refresh(asset)

    except Exception:

        db.rollback()
        raise

    return asset


# =====================================================
# GeoJSON Export
# =====================================================

def get_assets_geojson(
    db: Session,
    layer_id: int,
):

    sql = text(
        """
        SELECT json_build_object(

            'type',
            'FeatureCollection',

            'features',
            COALESCE(
                json_agg(
                    json_build_object(

                        'type',
                        'Feature',

                        'geometry',
                        ST_AsGeoJSON(
                            geometry
                        )::json,

                        'properties',
                        attributes

                    )
                ),
                '[]'::json
            )

        )

        FROM assets

        WHERE layer_id = :layer_id
        """
    )

    result = db.execute(
        sql,
        {
            "layer_id": layer_id
        },
    )

    return result.scalar()