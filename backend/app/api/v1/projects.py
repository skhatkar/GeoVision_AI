from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User

from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
)

from app.core.security import get_current_user, get_optional_user

from app.services.project_service import (
    create_project,
    get_projects,
    get_project,
    update_project,
    delete_project,
)

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_project(
        db,
        project,
        current_user.id,
    )


@router.get(
    "",
    response_model=list[ProjectResponse],
)
def list_projects(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    owner_id = current_user.id if current_user else None
    return get_projects(
        db,
        owner_id,
    )


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_single_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    owner_id = current_user.id if current_user else None
    db_project = get_project(
        db,
        project_id,
        owner_id,
    )

    if not db_project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return db_project


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
)
def edit_project(
    project_id: int,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_project = get_project(
        db,
        project_id,
        current_user.id,
    )

    if not db_project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return update_project(
        db,
        db_project,
        project,
    )


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_project = get_project(
        db,
        project_id,
        current_user.id,
    )

    if not db_project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    delete_project(
        db,
        db_project,
    )

    return