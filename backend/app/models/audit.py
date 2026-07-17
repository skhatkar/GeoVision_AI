from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base_model import BaseModelMixin


class AuditLog(Base, BaseModelMixin):
    __tablename__ = "audit_logs"

    action = Column(
        String(255),
        nullable=False,
    )

    description = Column(Text)

    user_id = Column(
        ForeignKey("users.id"),
        nullable=False,
    )

    user = relationship("User")