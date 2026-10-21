from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.audit import AuditLogResponse
from app.services.audit_service import get_audit_logs

router = APIRouter(
    prefix="/audit",
    tags=["Audit Logs"],
)


@router.get(
    "/logs",
    response_model=list[AuditLogResponse],
)
def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, _ = get_audit_logs(
        db,
        skip=skip,
        limit=limit,
        entity_type=entity_type,
        entity_id=entity_id,
    )
    return items


@router.get(
    "/logs/{entity_type}/{entity_id}",
    response_model=list[AuditLogResponse],
)
def entity_audit_logs(
    entity_type: str,
    entity_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, _ = get_audit_logs(
        db,
        skip=skip,
        limit=limit,
        entity_type=entity_type,
        entity_id=entity_id,
    )
    return items
