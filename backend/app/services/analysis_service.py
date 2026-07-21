import json

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




# =====================================================
# CENTROID
# =====================================================

def centroid_analysis(
    db,
    layer_id:int,
):

    sql=text("""
        SELECT
            id,
            name,

            ST_AsGeoJSON(
                ST_Centroid(geometry)
            ) AS centroid

        FROM assets

        WHERE layer_id=:layer_id;
    """)


    rows=db.execute(
        sql,
        {
            "layer_id":layer_id
        }
    ).mappings().all()


    return {

        "layer_id":layer_id,

        "count":len(rows),

        "centroids":[
            {
                "id":row["id"],
                "name":row["name"],
                "centroid":
                    json.loads(row["centroid"])
                    if row["centroid"]
                    else None
            }

            for row in rows
        ]
    }



# =====================================================
# CONVEX HULL
# =====================================================

def convex_hull_analysis(
    db,
    layer_id:int,
):

    sql=text("""
        SELECT

        ST_AsGeoJSON(
            ST_ConvexHull(
                ST_Collect(geometry)
            )
        ) AS geometry

        FROM assets

        WHERE layer_id=:layer_id;
    """)


    result=db.execute(
        sql,
        {
            "layer_id":layer_id
        }
    ).mappings().first()


    if result is None or result["geometry"] is None:

        return {
            "layer_id":layer_id,
            "geometry":None
        }


    return {

        "layer_id":layer_id,

        "type":"Feature",

        "geometry":
            json.loads(result["geometry"])

    }




# =====================================================
# BOUNDING BOX
# =====================================================

def bbox_analysis(
    db,
    layer_id:int,
):

    sql=text("""
        SELECT

        ST_AsGeoJSON(
            ST_Envelope(
                ST_Collect(geometry)
            )
        ) AS bbox

        FROM assets

        WHERE layer_id=:layer_id;
    """)


    result=db.execute(
        sql,
        {
            "layer_id":layer_id
        }
    ).mappings().first()



    if result is None or result["bbox"] is None:

        return {

            "layer_id":layer_id,

            "bbox":None

        }



    return {

        "layer_id":layer_id,

        "bbox":
            json.loads(result["bbox"])

    }




# =====================================================
# POLYGON AREA
# =====================================================

def area_analysis(
    db,
    layer_id:int,
):

    sql=text("""
        SELECT

        SUM(
            ST_Area(
                ST_Transform(
                    geometry,
                    3857
                )
            )
        ) AS area_sq_meter,


        COUNT(*) AS feature_count


        FROM assets

        WHERE layer_id=:layer_id;

    """)


    result=db.execute(
        sql,
        {
            "layer_id":layer_id
        }
    ).mappings().first()



    area = (

        result["area_sq_meter"]

        if result and result["area_sq_meter"]

        else 0

    )



    return {

        "layer_id":layer_id,

        "feature_count":
            result["feature_count"]
            if result
            else 0,


        "area_sq_meter":area,


        "area_sq_km":
            area/1000000

    }




# =====================================================
# LINE LENGTH
# =====================================================

def length_analysis(
    db,
    layer_id:int,
):

    sql=text("""
        SELECT

        SUM(
            ST_Length(
                geography(geometry)
            )
        )

        AS length_meter


        FROM assets

        WHERE layer_id=:layer_id;

    """)


    result=db.execute(
        sql,
        {
            "layer_id":layer_id
        }
    ).mappings().first()



    length = (

        result["length_meter"]

        if result and result["length_meter"]

        else 0

    )



    return {

        "layer_id":layer_id,

        "length_meter":length,

        "length_km":
            length/1000

    }


# =====================================================
# CLIP
# =====================================================

def clip_analysis(
    db,
    input_layer_id:int,
    clip_layer_id:int,
):

    sql=text("""
        SELECT

        a.id,
        a.name,

        ST_AsGeoJSON(
            ST_Intersection(
                a.geometry,
                b.geometry
            )
        ) AS geometry,

        a.attributes


        FROM assets a

        JOIN assets b

        ON ST_Intersects(
            a.geometry,
            b.geometry
        )


        WHERE
        a.layer_id=:input_layer

        AND

        b.layer_id=:clip_layer;

    """)


    rows=db.execute(
        sql,
        {
            "input_layer":input_layer_id,
            "clip_layer":clip_layer_id
        }
    ).mappings().all()


    return {
        "count":len(rows),
        "features":rows
    }


# =====================================================
# UNION
# =====================================================

def union_analysis(
    db,
    layer_id:int,
):

    sql=text("""
        SELECT

        ST_AsGeoJSON(
            ST_Union(geometry)
        ) AS geometry

        FROM assets

        WHERE layer_id=:layer_id;

    """)


    result=db.execute(
        sql,
        {
            "layer_id":layer_id
        }
    ).mappings().first()


    return {

        "type":"Feature",

        "geometry":
            json.loads(result["geometry"])
            if result and result["geometry"]
            else None

    }



# =====================================================
# DIFFERENCE
# =====================================================

def difference_analysis(
    db,
    layer1_id:int,
    layer2_id:int,
):

    sql=text("""
        SELECT

        a.id,

        ST_AsGeoJSON(
            ST_Difference(
                a.geometry,
                b.geometry
            )
        ) AS geometry


        FROM assets a

        JOIN assets b

        ON ST_Intersects(
            a.geometry,
            b.geometry
        )


        WHERE
        a.layer_id=:layer1

        AND

        b.layer_id=:layer2;

    """)


    rows=db.execute(
        sql,
        {
            "layer1":layer1_id,
            "layer2":layer2_id
        }
    ).mappings().all()


    return {
        "count":len(rows),
        "results":rows
    }




# =====================================================
# DISSOLVE
# =====================================================

def dissolve_analysis(
    db,
    layer_id:int,
    field:str,
):

    sql=text(f"""
        SELECT

        attributes->>'{field}' AS category,

        ST_AsGeoJSON(
            ST_Union(geometry)
        ) AS geometry


        FROM assets

        WHERE layer_id=:layer_id


        GROUP BY attributes->>'{field}';

    """)


    rows=db.execute(
        sql,
        {
            "layer_id":layer_id
        }
    ).mappings().all()


    return rows




# =====================================================
# SPATIAL JOIN
# =====================================================

def spatial_join_analysis(
    db,
    target_layer_id:int,
    join_layer_id:int,
):

    sql=text("""
        SELECT

        a.id AS target_id,

        a.name AS target_name,

        b.id AS join_id,

        b.name AS join_name


        FROM assets a

        JOIN assets b

        ON ST_Intersects(
            a.geometry,
            b.geometry
        )


        WHERE

        a.layer_id=:target

        AND

        b.layer_id=:join;

    """)


    rows=db.execute(
        sql,
        {
            "target":target_layer_id,
            "join":join_layer_id
        }
    ).mappings().all()


    return rows



# =====================================================
# MULTI BUFFER
# =====================================================

def multi_buffer_analysis(
    db,
    layer_id:int,
    distance:float,
):

    sql=text("""
        SELECT

        id,

        name,

        ST_AsGeoJSON(
            ST_Buffer(
                geography(geometry),
                :distance
            )
        ) AS buffer


        FROM assets

        WHERE layer_id=:layer_id;

    """)


    rows=db.execute(
        sql,
        {
            "layer_id":layer_id,
            "distance":distance
        }
    ).mappings().all()


    return rows



# =====================================================
# HEATMAP
# =====================================================

def heatmap_analysis(
    db,
    layer_id:int,
):

    sql=text("""
        SELECT

        ST_AsGeoJSON(
            geometry
        ) AS point


        FROM assets

        WHERE layer_id=:layer_id;

    """)


    return db.execute(
        sql,
        {
            "layer_id":layer_id
        }
    ).mappings().all()



# =====================================================
# DENSITY
# =====================================================

def density_analysis(
    db,
    layer_id:int,
):

    sql=text("""
        SELECT

        COUNT(*) AS feature_count,

        ST_Extent(
            geometry
        ) AS extent


        FROM assets

        WHERE layer_id=:layer_id;

    """)


    return db.execute(
        sql,
        {
            "layer_id":layer_id
        }
    ).mappings().first()



# =====================================================
# KMEANS CLUSTER
# =====================================================

def kmeans_analysis(
    db,
    layer_id:int,
    clusters:int=5,
):

    sql=text("""
        SELECT

        id,

        name,

        ST_ClusterKMeans(
            geometry,
            :clusters
        )
        OVER()

        AS cluster_id


        FROM assets

        WHERE layer_id=:layer_id;

    """)


    return db.execute(
        sql,
        {
            "layer_id":layer_id,
            "clusters":clusters
        }
    ).mappings().all()