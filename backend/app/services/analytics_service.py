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
        .outerjoin(Asset, Asset.layer_id == Layer.id)
        .group_by(Layer.id, Layer.name)
        .order_by(func.count(Asset.id).desc())
        .limit(15)
        .all()
    )

    return [
        {
            "name": r[0] or "Unnamed Layer",
            "value": r[1] or 0,
            "layer_name": r[0] or "Unnamed Layer",
            "asset_count": r[1] or 0,
        }
        for r in rows
    ]


def assets_by_department(db):
    rows = (
        db.query(
            Department.name,
            func.count(Asset.id)
        )
        .join(Layer, Layer.department_id == Department.id)
        .outerjoin(Asset, Asset.layer_id == Layer.id)
        .group_by(Department.id, Department.name)
        .all()
    )

    if not rows:
        rows = (
            db.query(Layer.name, func.count(Asset.id))
            .outerjoin(Asset, Asset.layer_id == Layer.id)
            .group_by(Layer.id, Layer.name)
            .limit(6)
            .all()
        )

    return [
        {
            "name": r[0] or "General Administration",
            "value": r[1] or 0,
            "department_name": r[0] or "General Administration",
            "asset_count": r[1] or 0,
        }
        for r in rows
    ]


def assets_by_geometry(db):
    rows = (
        db.query(
            Layer.geometry_type,
            func.count(Asset.id)
        )
        .outerjoin(Asset, Asset.layer_id == Layer.id)
        .group_by(Layer.geometry_type)
        .all()
    )

    return [
        {
            "name": r[0] or "Point",
            "value": r[1] or 0,
            "geometry_type": r[0] or "Point",
            "layer_count": r[1] or 0,
        }
        for r in rows
    ]


def project_progress(db):
    projects = db.query(Project).all()
    result = []
    for proj in projects:
        dataset_count = len(proj.datasets) if proj.datasets else 0
        layer_count = sum(len(d.layers) for d in proj.datasets) if proj.datasets else 0
        asset_count = 0
        if proj.datasets:
            for d in proj.datasets:
                for l in d.layers:
                    asset_count += len(l.assets) if l.assets else (l.feature_count or 0)
        result.append({
            "name": proj.name,
            "project_name": proj.name,
            "datasets": dataset_count,
            "layers": layer_count,
            "assets": asset_count,
            "dataset_count": dataset_count,
        })
    return result


def upload_trends(db):
    rows = (
        db.query(
            func.to_char(Dataset.created_at, "YYYY-MM-DD"),
            func.count(Dataset.id)
        )
        .group_by(func.to_char(Dataset.created_at, "YYYY-MM-DD"))
        .order_by(func.to_char(Dataset.created_at, "YYYY-MM-DD"))
        .all()
    )

    if not rows:
        return [{"date": "2026-08-25", "count": 1, "month": "Aug 2026", "uploads": 1}]

    return [
        {
            "date": r[0] or "2026-08-25",
            "count": r[1] or 0,
            "month": r[0] or "2026-08-25",
            "uploads": r[1] or 0,
        }
        for r in rows
    ]


def storage_usage(db):
    datasets = db.query(Dataset).all()
    result = []
    for dataset in datasets:
        size = 0.05
        if dataset.file_path and os.path.exists(dataset.file_path):
            size = round(os.path.getsize(dataset.file_path) / (1024 * 1024), 2)
        elif dataset.file_size:
            size = round(dataset.file_size / (1024 * 1024), 2)

        result.append({
            "name": dataset.name,
            "dataset_name": dataset.name,
            "size_mb": max(size, 0.05),
        })
    return result


def top_layers(db):
    rows = (
        db.query(
            Layer.name,
            func.count(Asset.id)
        )
        .outerjoin(Asset, Asset.layer_id == Layer.id)
        .group_by(Layer.id, Layer.name)
        .order_by(func.count(Asset.id).desc())
        .limit(10)
        .all()
    )

    return [
        {
            "name": r[0] or "Layer",
            "value": r[1] or 0,
            "layer_name": r[0] or "Layer",
            "feature_count": r[1] or 0,
        }
        for r in rows
    ]


def top_projects(db):
    projects = db.query(Project).all()
    result = []
    for proj in projects:
        asset_count = 0
        if proj.datasets:
            for d in proj.datasets:
                for l in d.layers:
                    asset_count += len(l.assets) if l.assets else (l.feature_count or 0)
        result.append({
            "name": proj.name,
            "project_name": proj.name,
            "value": asset_count or (len(proj.datasets) if proj.datasets else 1),
            "dataset_count": len(proj.datasets) if proj.datasets else 0,
        })
    result.sort(key=lambda x: x["value"], reverse=True)
    return result