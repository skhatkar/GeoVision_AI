from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


def create_project(
    db: Session,
    project: ProjectCreate,
    owner_id: int,
):
    db_project = Project(
        name=project.name,
        description=project.description,
        owner_id=owner_id,
    )

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return db_project


def get_projects(
    db: Session,
    owner_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
):
    query = db.query(Project)
    if owner_id:
        query = query.filter(Project.owner_id == owner_id)
    total = query.count()
    items = (
        query.order_by(Project.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items, total


def get_project(
    db: Session,
    project_id: int,
    owner_id: int | None = None,
):
    return (
        db.query(Project)
        .filter(
            Project.id == project_id,
        )
        .first()
    )


def update_project(
    db: Session,
    db_project: Project,
    project: ProjectUpdate,
):
    update_data = project.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_project, key, value)

    db.commit()
    db.refresh(db_project)

    return db_project


def delete_project(
    db: Session,
    db_project: Project,
):
    db.delete(db_project)
    db.commit()