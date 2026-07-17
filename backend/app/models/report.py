from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base_model import BaseModelMixin


class Report(Base, BaseModelMixin):
    __tablename__ = "reports"

    name = Column(String(200), nullable=False)

    report_type = Column(String(100))

    file_path = Column(String(500))

    project_id = Column(
        ForeignKey("projects.id"),
        nullable=False,
    )

    project = relationship("Project")