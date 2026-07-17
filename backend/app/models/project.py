from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base_model import BaseModelMixin


class Project(Base, BaseModelMixin):
    __tablename__ = "projects"

    name = Column(
        String(200),
        nullable=False,
    )

    description = Column(Text)

    owner_id = Column(
        ForeignKey("users.id"),
        nullable=False,
    )

    owner = relationship(
        "User",
        back_populates="projects",
    )

    datasets = relationship(
        "Dataset",
        back_populates="project",
        cascade="all, delete-orphan",
    )