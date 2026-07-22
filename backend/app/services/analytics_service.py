import os

from sqlalchemy import func

from app.models.asset import Asset
from app.models.layer import Layer
from app.models.department import Department
from app.models.dataset import Dataset
from app.models.project import Project


def assets_by_layer(db):

    rows = (
        db.query(
            Layer.name,
            func.count(Asset.id)
        )
        .outerjoin(Asset)
        .group_by(Layer.id)
        .order_by(func.count(Asset.id).desc())
        .all()
    )

    return [
        {
            "layer_name": r[0],
            "asset_count": r[1],
        }
        for r in rows
    ]


def assets_by_department(db):

    rows = (
        db.query(
            Department.name,
            func.count(Asset.id)
        )
        .outerjoin(Asset)
        .group_by(Department.id)
        .all()
    )

    return [
        {
            "department_name": r[0],
            "asset_count": r[1],
        }
        for r in rows
    ]


def assets_by_geometry(db):

    rows = (
        db.query(
            Layer.geometry_type,
            func.count(Layer.id)
        )
        .group_by(Layer.geometry_type)
        .all()
    )

    return [
        {
            "geometry_type": r[0],
            "layer_count": r[1],
        }
        for r in rows
    ]


def project_progress(db):

    rows = (
        db.query(
            Project.name,
            func.count(Dataset.id)
        )
        .outerjoin(Dataset)
        .group_by(Project.id)
        .all()
    )

    return [
        {
            "project_name": r[0],
            "dataset_count": r[1],
        }
        for r in rows
    ]


def upload_trends(db):

    rows = (
        db.query(
            func.to_char(
                Dataset.created_at,
                "Mon YYYY"
            ),
            func.count(Dataset.id)
        )
        .group_by(
            func.to_char(
                Dataset.created_at,
                "Mon YYYY"
            )
        )
        .all()
    )

    return [
        {
            "month": r[0],
            "uploads": r[1],
        }
        for r in rows
    ]


def storage_usage(db):

    datasets = db.query(Dataset).all()

    result = []

    for dataset in datasets:

        size = 0

        if dataset.file_path:

            if os.path.exists(dataset.file_path):

                size = round(
                    os.path.getsize(dataset.file_path)
                    / 1024
                    / 1024,
                    2,
                )

        result.append(
            {
                "dataset_name": dataset.name,
                "size_mb": size,
            }
        )

    return result


def top_layers(db):

    rows = (
        db.query(
            Layer.name,
            Layer.feature_count
        )
        .order_by(
            Layer.feature_count.desc()
        )
        .limit(10)
        .all()
    )

    return [
        {
            "layer_name": r[0],
            "feature_count": r[1],
        }
        for r in rows
    ]


def top_projects(db):

    rows = (
        db.query(
            Project.name,
            func.count(Dataset.id)
        )
        .outerjoin(Dataset)
        .group_by(Project.id)
        .order_by(
            func.count(Dataset.id).desc()
        )
        .limit(10)
        .all()
    )

    return [
        {
            "project_name": r[0],
            "dataset_count": r[1],
        }
        for r in rows
    ]