from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ReportGenerateRequest(BaseModel):
    project_id: int
    report_type: Optional[str] = "summary"


class ReportResponse(BaseModel):
    id: int
    name: str
    report_type: Optional[str] = None
    file_path: Optional[str] = None
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True
