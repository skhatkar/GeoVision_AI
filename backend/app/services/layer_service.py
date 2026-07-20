from sqlalchemy.orm import Session

from app.models.dataset import Dataset
from app.models.layer import Layer
from app.models.department import Department


def create_layer(
    db: Session,
    dataset: Dataset,
):
    department = db.query(Department).first()

    if department is None:
        return None

    layer = Layer(
        name=dataset.name,
        geometry_type=dataset.geometry_type,
        crs=dataset.crs,
        feature_count=dataset.feature_count,
        file_path=dataset.file_path,
        dataset_id=dataset.id,
        department_id=department.id,
    )

    db.add(layer)
    db.commit()
    db.refresh(layer)

    return layer


def get_layers(db: Session):
    return (
        db.query(Layer)
        .order_by(Layer.created_at.desc())
        .all()
    )


def get_layer(
    db: Session,
    layer_id: int,
):
    return (
        db.query(Layer)
        .filter(Layer.id == layer_id)
        .first()
    )


def delete_layer(
    db: Session,
    layer: Layer,
):
    db.delete(layer)
    db.commit()