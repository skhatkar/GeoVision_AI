from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
)

from app.services.department_service import (
    create_department,
    get_departments,
    get_department,
    update_department,
    delete_department,
)

router = APIRouter()


# ---------------------------------------------
# List Departments
# ---------------------------------------------
@router.get(
    "/",
    response_model=list[DepartmentResponse],
)
def list_departments(
    db: Session = Depends(get_db),
):

    return get_departments(db)


# ---------------------------------------------
# Department Detail
# ---------------------------------------------
@router.get(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def department_detail(
    department_id: int,
    db: Session = Depends(get_db),
):

    department = get_department(
        db,
        department_id,
    )

    if department is None:
        raise HTTPException(
            status_code=404,
            detail="Department not found.",
        )

    return department


# ---------------------------------------------
# Create
# ---------------------------------------------
@router.post(
    "/",
    response_model=DepartmentResponse,
    status_code=201,
)
def create(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
):

    return create_department(
        db=db,
        name=department.name,
        description=department.description,
    )


# ---------------------------------------------
# Update
# ---------------------------------------------
@router.put(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def update(
    department_id: int,
    data: DepartmentUpdate,
    db: Session = Depends(get_db),
):

    department = get_department(
        db,
        department_id,
    )

    if department is None:
        raise HTTPException(
            status_code=404,
            detail="Department not found.",
        )

    return update_department(
        db=db,
        department=department,
        name=data.name,
        description=data.description,
    )


# ---------------------------------------------
# Delete
# ---------------------------------------------
@router.delete("/{department_id}")
def remove(
    department_id: int,
    db: Session = Depends(get_db),
):

    department = get_department(
        db,
        department_id,
    )

    if department is None:
        raise HTTPException(
            status_code=404,
            detail="Department not found.",
        )

    delete_department(
        db,
        department,
    )

    return {
        "message": "Department deleted successfully."
    }