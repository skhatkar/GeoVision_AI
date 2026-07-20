from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base_model import BaseModelMixin


class Department(Base, BaseModelMixin):
    __tablename__ = "departments"

    name = Column(
        String(150),
        unique=True,
        nullable=False,
    )

    description = Column(
        String(255),
    )

    users = relationship(
        "User",
        back_populates="department",
    )

    layers = relationship(
        "Layer",
        back_populates="department",
        cascade="all, delete-orphan",
    )