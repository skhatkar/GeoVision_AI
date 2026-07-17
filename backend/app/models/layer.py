from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base_model import BaseModelMixin


class Layer(Base, BaseModelMixin):
    __tablename__ = "layers"

    name = Column(
        String(200),
        nullable=False,
    )

    geometry_type = Column(String(50))

    crs = Column(String(50))

    feature_count = Column(Integer, default=0)

    file_path = Column(String(500))

    dataset_id = Column(
        ForeignKey("datasets.id"),
        nullable=False,
    )

    department_id = Column(
        ForeignKey("departments.id"),
        nullable=False,
    )

    dataset = relationship(
        "Dataset",
        back_populates="layers",
    )

    department = relationship(
        "Department",
        back_populates="layers",
    )

    assets = relationship(
        "Asset",
        back_populates="layer",
        cascade="all, delete-orphan",
    )