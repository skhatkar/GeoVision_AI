from shapely.wkt import dumps
from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.models.layer import Layer


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
    name = None

    for field in [
        "name",
        "Name",
        "NAME",
        "Village",
        "Hospital",
        "School",
        "Road_Name",
    ]:
        if field in attributes:
            name = str(attributes[field])
            break

    asset = Asset(
        name=name,
        geometry=f"SRID=4326;{dumps(geometry)}",
        attributes=attributes,
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
    print("\n========== bulk_create_assets() started ==========")

    if gdf.empty:
        print("GeoDataFrame is empty.")
        return 0

    print(f"Layer ID : {layer.id}")
    print(f"Total Features : {len(gdf)}")

    assets = []

    for index, row in gdf.iterrows():

        geometry = row.geometry

        if geometry is None:
            print(f"Skipping feature {index} (geometry is None)")
            continue

        attributes = (
            row.drop(labels="geometry")
            .fillna("")
            .to_dict()
        )

        name = None

        for field in [
            "name",
            "Name",
            "NAME",
            "Village",
            "Hospital",
            "School",
            "Road_Name",
        ]:
            if field in attributes:
                name = str(attributes[field])
                break

        print(f"Creating Asset #{index + 1} -> {name}")

        asset = Asset(
            name=name,
            geometry=f"SRID=4326;{dumps(geometry)}",
            attributes=attributes,
            layer_id=layer.id,
        )

        assets.append(asset)

    print(f"\nAssets Prepared : {len(assets)}")

    if not assets:
        print("No assets to save.")
        return 0

    try:
        db.add_all(assets)

        print("Calling commit()...")
        db.commit()

        print("Commit Successful!")

    except Exception as e:
        db.rollback()

        print("\n========== DATABASE ERROR ==========")
        print(e)
        print("====================================\n")

        raise

    print("========== bulk_create_assets() finished ==========\n")

    return len(assets)


# =====================================================
# Get Assets By Layer
# =====================================================

def get_assets(
    db: Session,
    layer_id: int,
):
    return (
        db.query(Asset)
        .filter(Asset.layer_id == layer_id)
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
        .filter(Asset.id == asset_id)
        .first()
    )


# =====================================================
# Delete Asset
# =====================================================

def delete_asset(
    db: Session,
    asset: Asset,
):
    db.delete(asset)
    db.commit()