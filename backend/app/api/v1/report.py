import os
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.security import get_current_user, get_optional_user
from app.schemas.report import ReportGenerateRequest, ReportResponse
from app.services.report_service import (
    generate_project_pdf_report,
    get_reports_by_project,
    get_report_by_id,
    delete_report,
)
from app.services.audit_service import log_action
from app.common.request_utils import get_client_ip

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.post(
    "/generate",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project_report(
    body: ReportGenerateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = generate_project_pdf_report(
        db=db,
        project_id=body.project_id,
        report_type=body.report_type or "summary",
    )

    ip_address = get_client_ip(request)
    log_action(
        db,
        action="REPORT_GENERATE",
        user_id=current_user.id,
        description=f"Generated PDF report '{report.name}' for Project ID {body.project_id}",
        entity_type="report",
        entity_id=report.id,
        ip_address=ip_address,
    )

    return report


@router.get(
    "/project/{project_id}",
    response_model=list[ReportResponse],
)
def list_project_reports(
    project_id: int,
    db: Session = Depends(get_db),
):
    return get_reports_by_project(db, project_id)


@router.get(
    "/{report_id}/download",
)
def download_report(
    report_id: int,
    db: Session = Depends(get_db),
):
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    if not report.file_path or not os.path.exists(report.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report PDF file does not exist on disk.",
        )

    filename = os.path.basename(report.file_path)
    return FileResponse(
        path=report.file_path,
        media_type="application/pdf",
        filename=filename,
    )


@router.delete(
    "/{report_id}",
    status_code=status.HTTP_200_OK,
)
def remove_report_file(
    report_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    report_name = report.name
    delete_report(db, report)

    ip_address = get_client_ip(request)
    log_action(
        db,
        action="REPORT_DELETE",
        user_id=current_user.id if current_user else None,
        description=f"Deleted PDF report '{report_name}' (ID: {report_id})",
        entity_type="report",
        entity_id=report_id,
        ip_address=ip_address,
    )

    return {"message": "Report deleted successfully."}
