from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base_model import BaseModelMixin


class Dataset(Base, BaseModelMixin):
    __tablename__ = "datasets"

    name = Column(
        String(200),
        nullable=False,
    )

    description = Column(Text)

    source = Column(String(255))

    project_id = Column(
        ForeignKey("projects.id"),
        nullable=False,
    )

    project = relationship(
        "Project",
        back_populates="datasets",
    )

    layers = relationship(
        "Layer",
        back_populates="dataset",
        cascade="all, delete-orphan",
    )