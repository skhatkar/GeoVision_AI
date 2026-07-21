from shapely import wkb
from sqlalchemy.orm import Session
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping

from app.models.asset import Asset


def layer_to_geojson(
    db: Session,
    layer_id: int,
):
    """
    Convert all assets of a layer
    into a GeoJSON FeatureCollection.
    """

    assets = (
        db.query(Asset)
        .filter(Asset.layer_id == layer_id)
        .all()
    )

    features = []

    for asset in assets:

        geometry = to_shape(asset.geometry)

        feature = {
            "type": "Feature",
            "geometry": mapping(geometry),
            "properties": {
                "id": asset.id,
                "name": asset.name,
                **asset.attributes,
            },
        }

        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features,
    }