from sqlalchemy.orm import Session

from app.models.department import Department


# ---------------------------------------------
# Create
# ---------------------------------------------
def create_department(
    db: Session,
    *,
    name: str,
    description: str | None = None,
):

    department = Department(
        name=name,
        description=description,
    )

    db.add(department)
    db.commit()
    db.refresh(department)

    return department


# ---------------------------------------------
# Get All
# ---------------------------------------------
def get_departments(db: Session):

    return (
        db.query(Department)
        .order_by(Department.name)
        .all()
    )


# ---------------------------------------------
# Get One
# ---------------------------------------------
def get_department(
    db: Session,
    department_id: int,
):

    return (
        db.query(Department)
        .filter(
            Department.id == department_id
        )
        .first()
    )


# ---------------------------------------------
# Update
# ---------------------------------------------
def update_department(
    db: Session,
    department: Department,
    *,
    name: str | None,
    description: str | None,
):

    if name is not None:
        department.name = name

    if description is not None:
        department.description = description

    db.commit()
    db.refresh(department)

    return department


# ---------------------------------------------
# Delete
# ---------------------------------------------
def delete_department(
    db: Session,
    department: Department,
):

    db.delete(department)
    db.commit()