from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base_model import BaseModelMixin


class Asset(Base, BaseModelMixin):
    __tablename__ = "assets"

    name = Column(
        String(255),
        nullable=True,
    )

    geometry = Column(
        Geometry(
            geometry_type="GEOMETRY",
            srid=4326,
        ),
        nullable=False,
    )

    attributes = Column(
        JSONB,
        nullable=False,
        default=dict,
    )

    layer_id = Column(
        ForeignKey("layers.id"),
        nullable=False,
    )

    layer = relationship(
        "Layer",
        back_populates="assets",
    )