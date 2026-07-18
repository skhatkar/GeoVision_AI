from sqlalchemy.orm import Session

from app.models.project import Project


def create(db: Session, project: Project):

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


def get_all(db: Session):

    return db.query(Project).all()


def get_by_id(db: Session, project_id: int):

    return (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )


def delete(db: Session, project: Project):

    db.delete(project)
    db.commit()