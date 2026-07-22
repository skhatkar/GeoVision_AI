from sqlalchemy.orm import Session
from sqlalchemy import text


# ==========================================================
# AI LAYER SUMMARY
# ==========================================================

def get_layer_summary(
    db: Session,
    layer_id: int,
):
    sql = text("""
        SELECT
            l.id,
            l.name,
            l.geometry_type,
            l.feature_count,
            l.crs,
            d.name AS dataset_name,
            dep.name AS department_name
        FROM layers l
        LEFT JOIN datasets d
            ON l.dataset_id = d.id
        LEFT JOIN departments dep
            ON l.department_id = dep.id
        WHERE l.id = :layer_id
    """)

    row = db.execute(
        sql,
        {"layer_id": layer_id}
    ).mappings().first()

    if not row:
        return {"error": "Layer not found"}

    summary = (
        f"The layer '{row['name']}' contains "
        f"{row['feature_count']} {row['geometry_type']} feature(s). "
        f"It belongs to dataset '{row['dataset_name']}' "
        f"and department '{row['department_name']}'. "
        f"The coordinate reference system is {row['crs']}."
    )

    return {
        "layer_id": row["id"],
        "layer_name": row["name"],
        "geometry_type": row["geometry_type"],
        "feature_count": row["feature_count"],
        "crs": row["crs"],
        "dataset_name": row["dataset_name"],
        "department_name": row["department_name"],
        "summary": summary,
    }


# ==========================================================
# AI DATASET SUMMARY
# ==========================================================

def get_dataset_summary(
    db: Session,
    dataset_id: int,
):
    sql = text("""
        SELECT
            d.id,
            d.name,
            d.geometry_type,
            d.crs,

            COUNT(DISTINCT l.id) AS total_layers,
            COUNT(a.id) AS total_assets

        FROM datasets d

        LEFT JOIN layers l
            ON l.dataset_id=d.id

        LEFT JOIN assets a
            ON a.layer_id=l.id

        WHERE d.id=:dataset_id

        GROUP BY
            d.id,
            d.name,
            d.geometry_type,
            d.crs
    """)

    row = db.execute(
        sql,
        {"dataset_id": dataset_id},
    ).mappings().first()

    if not row:
        return {"error": "Dataset not found"}

    summary = (
        f"Dataset '{row['name']}' contains "
        f"{row['total_layers']} layer(s) and "
        f"{row['total_assets']} asset(s). "
        f"Geometry type is {row['geometry_type']}."
    )

    return {
        "dataset_id": row["id"],
        "dataset_name": row["name"],
        "total_layers": row["total_layers"],
        "total_assets": row["total_assets"],
        "geometry_type": row["geometry_type"],
        "crs": row["crs"],
        "summary": summary,
    }


# ==========================================================
# AI PROJECT SUMMARY
# ==========================================================

def get_project_summary(
    db: Session,
    project_id: int,
):
    sql = text("""
        SELECT

            p.id,
            p.name,

            COUNT(DISTINCT d.id) AS total_datasets,
            COUNT(DISTINCT l.id) AS total_layers,
            COUNT(a.id) AS total_assets

        FROM projects p

        LEFT JOIN datasets d
            ON d.project_id=p.id

        LEFT JOIN layers l
            ON l.dataset_id=d.id

        LEFT JOIN assets a
            ON a.layer_id=l.id

        WHERE p.id=:project_id

        GROUP BY
            p.id,
            p.name
    """)

    row = db.execute(
        sql,
        {"project_id": project_id},
    ).mappings().first()

    if not row:
        return {"error": "Project not found"}

    summary = (
        f"Project '{row['name']}' contains "
        f"{row['total_datasets']} dataset(s), "
        f"{row['total_layers']} layer(s), "
        f"and {row['total_assets']} asset(s)."
    )

    return {
        "project_id": row["id"],
        "project_name": row["name"],
        "total_datasets": row["total_datasets"],
        "total_layers": row["total_layers"],
        "total_assets": row["total_assets"],
        "summary": summary,
    }


# ==========================================================
# AI LAYER HEALTH
# ==========================================================

def get_layer_health(
    db: Session,
    layer_id: int,
):
    sql = text("""
        SELECT
            COUNT(*) AS total_assets,
            COUNT(name) AS named_assets,
            COUNT(geometry) AS geometry_assets
        FROM assets
        WHERE layer_id=:layer_id
    """)

    row = db.execute(
        sql,
        {"layer_id": layer_id},
    ).mappings().first()

    if row["total_assets"] == 0:
        score = 0
    else:
        score = (
            (
                row["named_assets"] +
                row["geometry_assets"]
            ) /
            (row["total_assets"] * 2)
        ) * 100

    if score >= 95:
        grade = "A+"
    elif score >= 85:
        grade = "A"
    elif score >= 70:
        grade = "B"
    elif score >= 50:
        grade = "C"
    else:
        grade = "D"

    return {
        "layer_id": layer_id,
        "health_score": round(score, 2),
        "grade": grade,
        "status": "Healthy" if score >= 85 else "Needs Improvement",
    }


# ==========================================================
# DATA QUALITY
# ==========================================================

def get_data_quality(
    db: Session,
    layer_id: int,
):
    sql = text("""
        SELECT
            COUNT(*) total_assets,
            COUNT(*) FILTER (WHERE geometry IS NULL) missing_geometry,
            COUNT(*) FILTER (WHERE name IS NULL) missing_name
        FROM assets
        WHERE layer_id=:layer_id
    """)

    row = db.execute(
        sql,
        {"layer_id": layer_id},
    ).mappings().first()

    total = row["total_assets"] or 1

    completeness = (
        ((total - row["missing_name"]) / total)
        * 100
    )

    quality = (
        ((total - row["missing_geometry"]) / total)
        * 100
    )

    return {
        "layer_id": layer_id,
        "total_assets": total,
        "missing_geometry": row["missing_geometry"],
        "duplicate_assets": 0,
        "invalid_coordinates": 0,
        "attribute_completeness": round(completeness, 2),
        "quality_score": round(quality, 2),
    }


# ==========================================================
# DUPLICATE ASSETS
# ==========================================================

def get_duplicate_assets(
    db: Session,
    layer_id: int,
):
    sql = text("""
        SELECT
            name,
            COUNT(*) duplicate_count
        FROM assets
        WHERE layer_id=:layer_id
        GROUP BY name
        HAVING COUNT(*)>1
    """)

    rows = db.execute(
        sql,
        {"layer_id": layer_id},
    ).mappings().all()

    return {
        "total_duplicates": len(rows),
        "duplicates": rows,
    }


# ==========================================================
# MISSING GEOMETRY
# ==========================================================

def get_missing_geometry(
    db: Session,
    layer_id: int,
):
    sql = text("""
        SELECT
            id asset_id,
            name
        FROM assets
        WHERE
            layer_id=:layer_id
        AND
            geometry IS NULL
    """)

    rows = db.execute(
        sql,
        {"layer_id": layer_id},
    ).mappings().all()

    return {
        "total_missing": len(rows),
        "assets": rows,
    }


# ==========================================================
# INVALID COORDINATES
# ==========================================================

def get_invalid_coordinates(
    db: Session,
    layer_id: int,
):
    sql = text("""
        SELECT
            id asset_id,
            name,
            ST_Y(geometry) latitude,
            ST_X(geometry) longitude
        FROM assets
        WHERE
            layer_id=:layer_id
        AND
        (
            ST_Y(geometry)>90
            OR ST_Y(geometry)<-90
            OR ST_X(geometry)>180
            OR ST_X(geometry)<-180
        )
    """)

    rows = db.execute(
        sql,
        {"layer_id": layer_id},
    ).mappings().all()

    return {
        "total_invalid": len(rows),
        "assets": rows,
    }


# ==========================================================
# CRS CHECK
# ==========================================================

def get_crs_check(
    db: Session,
    layer_id: int,
):
    sql = text("""
        SELECT
            crs
        FROM layers
        WHERE id=:layer_id
    """)

    row = db.execute(
        sql,
        {"layer_id": layer_id},
    ).mappings().first()

    return {
        "layer_id": layer_id,
        "crs": row["crs"],
        "valid": row["crs"] == "EPSG:4326",
        "recommendation":
            "Ready for Web GIS"
            if row["crs"] == "EPSG:4326"
            else "Transform to EPSG:4326",
    }


# ==========================================================
# ATTRIBUTE COMPLETENESS
# ==========================================================

def get_attribute_completeness(
    db: Session,
    layer_id: int,
):
    sql = text("""
        SELECT
            COUNT(*) total,
            COUNT(name) filled
        FROM assets
        WHERE layer_id=:layer_id
    """)

    row = db.execute(
        sql,
        {"layer_id": layer_id},
    ).mappings().first()

    total = row["total"] or 1

    completion = (
        row["filled"] / total
    ) * 100

    return {
        "layer_id": layer_id,
        "completeness_percentage": round(completion, 2),
        "missing_attributes": [] if completion == 100 else ["name"],
    }