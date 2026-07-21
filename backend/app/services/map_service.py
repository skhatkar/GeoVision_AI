from sqlalchemy import text
from sqlalchemy.orm import Session


def get_layer_geojson(
    db: Session,
    layer_id: int,
):
    """
    Return all assets of a layer
    as a GeoJSON FeatureCollection.
    """

    query = text("""
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features',
            COALESCE(
                json_agg(
                    json_build_object(
                        'type', 'Feature',
                        'geometry', ST_AsGeoJSON(geometry)::json,
                        'properties', jsonb_build_object(
                            'id', id,
                            'name', name
                        ) || attributes
                    )
                ),
                '[]'::json
            )
        ) AS geojson
        FROM assets
        WHERE layer_id = :layer_id;
    """)

    result = db.execute(
        query,
        {
            "layer_id": layer_id,
        },
    ).scalar()

    return result