from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base_model import BaseModelMixin


class Dataset(Base, BaseModelMixin):
    __tablename__ = "datasets"

    name = Column(
        String(200),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    source = Column(
        String(255),
        nullable=True,
    )

    file_name = Column(
        String(255),
        nullable=False,
    )

    file_path = Column(
        Text,
        nullable=False,
    )

    file_type = Column(
        String(50),
        nullable=False,
    )

    geometry_type = Column(
        String(50),
        nullable=True,
    )

    crs = Column(
        String(100),
        nullable=True,
    )

    feature_count = Column(
        Integer,
        default=0,
    )

    project_id = Column(
        Integer,
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