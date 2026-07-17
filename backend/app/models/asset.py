from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from geoalchemy2 import Geometry

from app.db.database import Base
from app.models.base_model import BaseModelMixin


class Asset(Base, BaseModelMixin):
    __tablename__ = "assets"

    name = Column(
        String(255),
        nullable=False,
    )

    asset_type = Column(
        String(100),
        nullable=False,
    )

    geometry = Column(
        Geometry(
            geometry_type="GEOMETRY",
            srid=4326,
        ),
        nullable=False,
    )

    properties = Column(
        JSONB,
        default=dict,
    )

    status = Column(
        String(50),
        default="Active",
    )

    layer_id = Column(
        ForeignKey("layers.id"),
        nullable=False,
    )

    department_id = Column(
        ForeignKey("departments.id"),
        nullable=False,
    )

    layer = relationship(
        "Layer",
        back_populates="assets",
    )

    department = relationship(
        "Department",
        back_populates="assets",
    )