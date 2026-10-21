from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User

from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
)

from app.core.security import get_current_user, get_optional_user
from app.services.audit_service import log_action
from app.common.request_utils import get_client_ip
from app.common.pagination import PaginationParams, PaginatedResponse

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
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_project = create_project(
        db,
        project,
        current_user.id,
    )
    ip_address = get_client_ip(request)
    log_action(
        db,
        action="PROJECT_CREATE",
        user_id=current_user.id,
        description=f"Created project '{new_project.name}'",
        entity_type="project",
        entity_id=new_project.id,
        ip_address=ip_address,
    )
    return new_project


@router.get(
    "",
    response_model=PaginatedResponse[ProjectResponse],
)
def list_projects(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(),
    current_user: User | None = Depends(get_optional_user),
):
    owner_id = current_user.id if current_user else None
    items, total = get_projects(
        db,
        owner_id,
        skip=pagination.skip,
        limit=pagination.limit,
    )
    return PaginatedResponse.create(
        items=items,
        total=total,
        skip=pagination.skip,
        limit=pagination.limit,
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
    request: Request,
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

    updated = update_project(
        db,
        db_project,
        project,
    )

    ip_address = get_client_ip(request)
    log_action(
        db,
        action="PROJECT_UPDATE",
        user_id=current_user.id,
        description=f"Updated project '{updated.name}'",
        entity_type="project",
        entity_id=updated.id,
        ip_address=ip_address,
    )
    return updated


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_project(
    project_id: int,
    request: Request,
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

    proj_name = db_project.name
    proj_id = db_project.id
    delete_project(
        db,
        db_project,
    )

    ip_address = get_client_ip(request)
    log_action(
        db,
        action="PROJECT_DELETE",
        user_id=current_user.id,
        description=f"Deleted project '{proj_name}' (ID: {proj_id})",
        entity_type="project",
        entity_id=proj_id,
        ip_address=ip_address,
    )

    return