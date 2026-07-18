from sqlalchemy import (
    Column,
    ForeignKey,
    String,
    Text,
    Integer,
)

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

    source = Column(
        String(255),
    )

    # Uploaded file name
    filename = Column(
        String(255),
        nullable=False,
    )

    # zip, geojson, csv, xlsx...
    file_type = Column(
        String(50),
        nullable=False,
    )

    # Point / LineString / Polygon...
    geometry_type = Column(
        String(100),
    )

    # EPSG:4326
    crs = Column(
        String(100),
    )

    feature_count = Column(
        Integer,
        default=0,
    )

    # uploads/shapefiles/roads.zip
    file_path = Column(
        String(500),
        nullable=False,
    )

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