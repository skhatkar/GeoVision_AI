from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy.orm import relationship


from app.db.database import Base
from app.models.base_model import BaseModelMixin


class User(Base, BaseModelMixin):
    __tablename__ = "users"

    username = Column(
        String(100),
        unique=True,
        nullable=False,
    )

    full_name = Column(String(200))

    email = Column(
        String(200),
        unique=True,
    )

    password_hash = Column(
        String(255),
        nullable=False,
    )

    is_active = Column(
        Boolean,
        default=True,
    )

    role_id = Column(
        ForeignKey("roles.id"),
    )

    department_id = Column(
        ForeignKey("departments.id"),
    )

    role = relationship(
        "Role",
        back_populates="users",
    )

    department = relationship(
        "Department",
        back_populates="users",
    )

    projects = relationship(
        "Project",
        back_populates="owner",
        cascade="all, delete-orphan"
    )