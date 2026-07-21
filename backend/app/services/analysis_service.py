from sqlalchemy import text


def buffer_analysis(
    db,
    asset_id: int,
    distance: float,
):

    sql = text("""
    WITH selected AS (

        SELECT id, geometry
        FROM assets
        WHERE id=:asset_id

    ),

    buffer AS (

        SELECT
            ST_Buffer(
                geography(geometry),
                :distance
            )::geometry AS geom
        FROM selected

    )

    SELECT
        a.id,
        a.name,
        ST_AsGeoJSON(a.geometry) AS geometry,
        a.attributes

    FROM assets a,
         buffer b

    WHERE ST_Intersects(
        a.geometry,
        b.geom
    );
    """)

    rows = db.execute(
        sql,
        {
            "asset_id": asset_id,
            "distance": distance,
        },
    ).mappings().all()

    return {
        "count": len(rows),
        "assets": rows,
    }

from sqlalchemy import text


def intersect_analysis(
    db,
    layer1_id: int,
    layer2_id: int,
):
    sql = text("""
        SELECT
            a1.id AS asset1_id,
            a1.name AS asset1_name,
            a2.id AS asset2_id,
            a2.name AS asset2_name
        FROM assets a1
        JOIN assets a2
          ON ST_Intersects(a1.geometry, a2.geometry)
        WHERE
            a1.layer_id = :layer1_id
        AND
            a2.layer_id = :layer2_id
        AND
            a1.id <> a2.id;
    """)

    rows = db.execute(
        sql,
        {
            "layer1_id": layer1_id,
            "layer2_id": layer2_id,
        },
    ).mappings().all()

    return {
        "count": len(rows),
        "results": rows,
    }

def within_analysis(
    db,
    container_layer_id: int,
    target_layer_id: int,
):
    sql = text("""
        SELECT
            target.id AS asset_id,
            target.name AS asset_name,
            container.id AS container_id,
            container.name AS container_name
        FROM assets target
        JOIN assets container
            ON ST_Within(
                target.geometry,
                container.geometry
            )
        WHERE
            target.layer_id = :target_layer
        AND
            container.layer_id = :container_layer;
    """)

    rows = db.execute(
        sql,
        {
            "target_layer": target_layer_id,
            "container_layer": container_layer_id,
        },
    ).mappings().all()

    return {
        "count": len(rows),
        "results": rows,
    }

def contains_analysis(
    db,
    container_layer_id: int,
    target_layer_id: int,
):
    sql = text("""
        SELECT
            container.id AS container_id,
            container.name AS container_name,
            target.id AS asset_id,
            target.name AS asset_name
        FROM assets container
        JOIN assets target
            ON ST_Contains(
                container.geometry,
                target.geometry
            )
        WHERE
            container.layer_id=:container_layer
        AND
            target.layer_id=:target_layer;
    """)

    rows = db.execute(
        sql,
        {
            "container_layer": container_layer_id,
            "target_layer": target_layer_id,
        },
    ).mappings().all()

    return {
        "count": len(rows),
        "results": rows,
    }

def touches_analysis(
    db,
    layer1_id: int,
    layer2_id: int,
):
    sql = text("""
        SELECT
            a.id,
            a.name,
            b.id AS matched_asset,
            b.name AS matched_name
        FROM assets a
        JOIN assets b
            ON ST_Touches(a.geometry,b.geometry)
        WHERE a.layer_id=:layer1
        AND b.layer_id=:layer2;
    """)

    rows=db.execute(
        sql,
        {
            "layer1":layer1_id,
            "layer2":layer2_id
        }
    ).mappings().all()

    return {"count":len(rows),"results":rows}

def crosses_analysis(
    db,
    layer1_id:int,
    layer2_id:int,
):
    sql=text("""
        SELECT
            a.id,
            a.name,
            b.id AS matched_asset,
            b.name AS matched_name
        FROM assets a
        JOIN assets b
            ON ST_Crosses(a.geometry,b.geometry)
        WHERE a.layer_id=:layer1
        AND b.layer_id=:layer2;
    """)

    rows=db.execute(
        sql,
        {
            "layer1":layer1_id,
            "layer2":layer2_id
        }
    ).mappings().all()

    return {"count":len(rows),"results":rows}

def overlaps_analysis(
    db,
    layer1_id:int,
    layer2_id:int,
):
    sql=text("""
        SELECT
            a.id,
            a.name,
            b.id AS matched_asset,
            b.name AS matched_name
        FROM assets a
        JOIN assets b
            ON ST_Overlaps(a.geometry,b.geometry)
        WHERE a.layer_id=:layer1
        AND b.layer_id=:layer2;
    """)

    rows=db.execute(
        sql,
        {
            "layer1":layer1_id,
            "layer2":layer2_id
        }
    ).mappings().all()

    return {"count":len(rows),"results":rows}

def nearest_neighbor(
    db,
    latitude:float,
    longitude:float,
    limit:int=10,
):
    sql=text("""
        SELECT
            id,
            name,
            layer_id,
            ST_AsText(geometry) AS geometry,
            ST_Distance(
                geography(geometry),
                geography(
                    ST_SetSRID(
                        ST_Point(:lon,:lat),
                        4326
                    )
                )
            ) AS distance
        FROM assets
        ORDER BY geometry <-> ST_SetSRID(
            ST_Point(:lon,:lat),
            4326
        )
        LIMIT :limit;
    """)

    rows=db.execute(
        sql,
        {
            "lat":latitude,
            "lon":longitude,
            "limit":limit,
        }
    ).mappings().all()

    return rows