from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditLog


def log_action(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    description: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """
    Persist a structured audit trail log entry.
    """
    log_entry = AuditLog(
        action=action,
        user_id=user_id,
        description=description,
        entity_type=entity_type,
        entity_id=entity_id,
        ip_address=ip_address,
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


def get_audit_logs(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    user_id: Optional[int] = None,
):
    """
    Query audit logs with optional entity/user filtering and pagination.
    """
    query = db.query(AuditLog)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    total = query.count()
    items = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return items, total
