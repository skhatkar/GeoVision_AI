from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base_model import BaseModelMixin


class Role(Base, BaseModelMixin):
    __tablename__ = "roles"

    name = Column(
        String(50),
        unique=True,
        nullable=False,
    )

    description = Column(String(255))

    users = relationship(
        "User",
        back_populates="role",
    )