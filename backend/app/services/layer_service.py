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



    # =====================================================
# Get Dataset Layers
# =====================================================

def get_dataset_layers(
    db: Session,
    dataset_id: int,
):

    return (
        db.query(Layer)
        .filter(
            Layer.dataset_id == dataset_id
        )
        .order_by(
            Layer.created_at.desc()
        )
        .all()
    )



# =====================================================
# Get Department Layers
# =====================================================

def get_department_layers(
    db: Session,
    department_id:int,
):

    return (
        db.query(Layer)
        .filter(
            Layer.department_id == department_id
        )
        .order_by(
            Layer.created_at.desc()
        )
        .all()
    )



# =====================================================
# Update Layer
# =====================================================

def update_layer(
    db: Session,
    layer: Layer,
    data,
):

    if data.name is not None:
        layer.name=data.name


    if data.geometry_type is not None:
        layer.geometry_type=data.geometry_type


    if data.crs is not None:
        layer.crs=data.crs


    db.commit()

    db.refresh(layer)

    return layer