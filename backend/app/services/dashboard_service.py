import os

from sqlalchemy import func

from app.models.project import Project
from app.models.dataset import Dataset
from app.models.layer import Layer
from app.models.asset import Asset
from app.models.department import Department


def get_dashboard_summary(db):

    return {
        "total_projects": db.query(Project).count(),
        "total_datasets": db.query(Dataset).count(),
        "total_layers": db.query(Layer).count(),
        "total_assets": db.query(Asset).count(),
        "total_departments": db.query(Department).count(),
    }


def get_recent_projects(db):

    projects = (
        db.query(Project)
        .order_by(Project.created_at.desc())
        .limit(10)
        .all()
    )

    return projects


def get_recent_datasets(db):

    datasets = (
        db.query(Dataset)
        .order_by(Dataset.created_at.desc())
        .limit(10)
        .all()
    )

    return datasets


def get_recent_layers(db):

    layers = (
        db.query(Layer)
        .order_by(Layer.created_at.desc())
        .limit(10)
        .all()
    )

    return layers


def get_recent_assets(db):

    assets = (
        db.query(Asset)
        .order_by(Asset.created_at.desc())
        .limit(10)
        .all()
    )

    return assets


def get_storage_summary(db):

    datasets = db.query(Dataset).all()

    total_size = 0

    total_files = len(datasets)

    for dataset in datasets:

        if dataset.file_path:

            if os.path.exists(dataset.file_path):

                total_size += os.path.getsize(dataset.file_path)

    return {
        "total_files": total_files,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
    }


def get_geometry_summary(db):

    point = (
        db.query(func.count(Layer.id))
        .filter(Layer.geometry_type.ilike("%Point%"))
        .scalar()
    )

    line = (
        db.query(func.count(Layer.id))
        .filter(Layer.geometry_type.ilike("%Line%"))
        .scalar()
    )

    polygon = (
        db.query(func.count(Layer.id))
        .filter(Layer.geometry_type.ilike("%Polygon%"))
        .scalar()
    )

    return {
        "point_layers": point,
        "line_layers": line,
        "polygon_layers": polygon,
    }


def get_dashboard_statistics(db):

    return {
        "projects": db.query(Project).count(),
        "datasets": db.query(Dataset).count(),
        "layers": db.query(Layer).count(),
        "assets": db.query(Asset).count(),
    }