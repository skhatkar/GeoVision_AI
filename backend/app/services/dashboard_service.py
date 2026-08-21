import os

from sqlalchemy import func

from app.models.project import Project
from app.models.dataset import Dataset
from app.models.layer import Layer
from app.models.asset import Asset
from app.models.department import Department


# ============================================================
# DASHBOARD SUMMARY
# ============================================================

def get_dashboard_summary(db):
    return {
        "total_projects": db.query(Project).count(),
        "total_datasets": db.query(Dataset).count(),
        "total_layers": db.query(Layer).count(),
        "total_assets": db.query(Asset).count(),
        "total_departments": db.query(Department).count(),
    }


# ============================================================
# RECENT PROJECTS
# ============================================================

def get_recent_projects(db):

    projects = (
        db.query(Project)
        .order_by(Project.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": project.id,
            "name": project.name,
            "created_at": (
                project.created_at.isoformat()
                if project.created_at
                else None
            ),
        }
        for project in projects
    ]


# ============================================================
# RECENT DATASETS
# ============================================================

def get_recent_datasets(db):

    datasets = (
        db.query(Dataset)
        .order_by(Dataset.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": dataset.id,
            "name": dataset.name,
            "file_name": dataset.file_name,
            "file_type": dataset.file_type,
            "feature_count": dataset.feature_count,
            "project_id": dataset.project_id,
            "created_at": (
                dataset.created_at.isoformat()
                if dataset.created_at
                else None
            ),
        }
        for dataset in datasets
    ]


# ============================================================
# RECENT LAYERS
# ============================================================

def get_recent_layers(db):

    layers = (
        db.query(Layer)
        .order_by(Layer.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": layer.id,
            "name": layer.name,
            "geometry_type": layer.geometry_type,
            "feature_count": layer.feature_count,
            "dataset_id": layer.dataset_id,
            "department_id": layer.department_id,
            "created_at": (
                layer.created_at.isoformat()
                if layer.created_at
                else None
            ),
        }
        for layer in layers
    ]


# ============================================================
# RECENT ASSETS
#
# IMPORTANT:
# We intentionally DO NOT return geometry.
# PostGIS geometry becomes a WKBElement and FastAPI cannot
# directly serialize it to JSON.
# ============================================================

def get_recent_assets(db):

    assets = (
        db.query(Asset)
        .order_by(Asset.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": asset.id,
            "name": asset.name,
            "layer_id": asset.layer_id,
            "created_at": (
                asset.created_at.isoformat()
                if asset.created_at
                else None
            ),
        }
        for asset in assets
    ]


# ============================================================
# STORAGE SUMMARY
# ============================================================

def get_storage_summary(db):

    datasets = db.query(Dataset).all()

    total_size = 0
    total_files = len(datasets)

    for dataset in datasets:

        if dataset.file_path:

            if os.path.exists(dataset.file_path):

                try:
                    total_size += os.path.getsize(
                        dataset.file_path
                    )
                except OSError:
                    pass

    return {
        "total_files": total_files,
        "total_size_mb": round(
            total_size / (1024 * 1024),
            2,
        ),
    }


# ============================================================
# GEOMETRY SUMMARY
# ============================================================

def get_geometry_summary(db):

    point = (
        db.query(func.count(Layer.id))
        .filter(
            Layer.geometry_type.ilike("%Point%")
        )
        .scalar()
        or 0
    )

    line = (
        db.query(func.count(Layer.id))
        .filter(
            Layer.geometry_type.ilike("%Line%")
        )
        .scalar()
        or 0
    )

    polygon = (
        db.query(func.count(Layer.id))
        .filter(
            Layer.geometry_type.ilike("%Polygon%")
        )
        .scalar()
        or 0
    )

    return {
        "point_layers": point,
        "line_layers": line,
        "polygon_layers": polygon,
    }


# ============================================================
# DASHBOARD STATISTICS
# ============================================================

def get_dashboard_statistics(db):

    return {
        "projects": db.query(Project).count(),
        "datasets": db.query(Dataset).count(),
        "layers": db.query(Layer).count(),
        "assets": db.query(Asset).count(),
    }


# ============================================================
# ASSET DISTRIBUTION
#
# Groups assets according to their layer.
#
# Example:
#
# Roads       -> 420
# Schools     -> 310
# Hospitals   -> 180
#
# This is what feeds the dashboard pie chart.
# ============================================================

def get_asset_distribution(db):

    results = (
        db.query(
            Layer.name.label("name"),
            func.count(Asset.id).label("value"),
        )
        .join(
            Asset,
            Asset.layer_id == Layer.id,
        )
        .group_by(
            Layer.id,
            Layer.name,
        )
        .order_by(
            func.count(Asset.id).desc()
        )
        .all()
    )

    return [
        {
            "name": row.name or "Unnamed Layer",
            "value": int(row.value),
        }
        for row in results
    ]