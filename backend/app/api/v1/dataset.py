from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.core.security import get_current_user

from app.models.user import User

from app.schemas.dataset import DatasetResponse

from app.services.dataset_service import save_dataset

router = APIRouter(
    prefix="/datasets",
    tags=["Datasets"],
)


@router.post(
    "/upload",
    response_model=DatasetResponse,
)
def upload_dataset(
    project_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    try:

        dataset = save_dataset(
            db,
            file,
            project_id,
        )

        return dataset

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )