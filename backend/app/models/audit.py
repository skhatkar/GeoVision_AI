from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base_model import BaseModelMixin


class AuditLog(Base, BaseModelMixin):
    __tablename__ = "audit_logs"

    action = Column(
        String(255),
        nullable=False,
    )

    description = Column(Text, nullable=True)

    entity_type = Column(
        String(100),
        nullable=True,
        index=True,
    )

    entity_id = Column(
        Integer,
        nullable=True,
        index=True,
    )

    ip_address = Column(
        String(45),
        nullable=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    user = relationship("User")