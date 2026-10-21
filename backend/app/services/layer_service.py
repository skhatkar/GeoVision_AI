from sqlalchemy.orm import Session

from app.models.dataset import Dataset
from app.models.layer import Layer
from app.models.department import Department


# =====================================================
# Create Layer
# =====================================================

def create_layer(
    db: Session,
    dataset: Dataset,
):

    # -----------------------------------------
    # Select department
    # -----------------------------------------

    department = (
        db.query(Department)
        .order_by(
            Department.id.asc()
        )
        .first()
    )

    if department is None:

        return None

    # -----------------------------------------
    # Create layer
    # -----------------------------------------

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

    db.flush()

    db.refresh(layer)

    print(
        f"Layer created: {layer.id}"
    )

    return layer


# =====================================================
# Get All Layers
# =====================================================

def get_layers(
    db: Session,
    skip: int = 0,
    limit: int = 50,
):
    query = db.query(Layer)
    total = query.count()
    items = (
        query.order_by(
            Layer.created_at.desc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items, total


# =====================================================
# Get Layer
# =====================================================

def get_layer(
    db: Session,
    layer_id: int,
):

    return (
        db.query(Layer)
        .filter(
            Layer.id == layer_id
        )
        .first()
    )


# =====================================================
# Delete Layer
# =====================================================

def delete_layer(
    db: Session,
    layer: Layer,
):

    try:

        db.delete(
            layer
        )

        db.commit()

    except Exception:

        db.rollback()
        raise


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
    department_id: int,
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

        layer.name = data.name

    if data.geometry_type is not None:

        layer.geometry_type = (
            data.geometry_type
        )

    if data.crs is not None:

        layer.crs = data.crs

    try:

        db.commit()

        db.refresh(
            layer
        )

    except Exception:

        db.rollback()
        raise

    return layer