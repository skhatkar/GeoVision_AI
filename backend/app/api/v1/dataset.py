from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.dataset import DatasetResponse

from app.services.dataset_service import (
    save_uploaded_file,
    extract_zip,
    find_shapefile,
    read_dataset,
    create_dataset,
)

router = APIRouter(
    prefix="/datasets",
    tags=["Datasets"],
)


@router.post(
    "/upload",
    response_model=DatasetResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_dataset(
    project_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    # Save uploaded file
    saved_file = save_uploaded_file(file)

    # ---------------------------------------
    # ZIP Shapefile
    # ---------------------------------------
    if saved_file.lower().endswith(".zip"):

        extract_folder = extract_zip(saved_file)

        shp_file = find_shapefile(extract_folder)

        if shp_file is None:
            raise HTTPException(
                status_code=400,
                detail="No shapefile (.shp) found inside ZIP.",
            )

        dataset_path = shp_file

    else:

        dataset_path = saved_file

    # Read GIS dataset
    gdf = read_dataset(dataset_path)

    # Save metadata into PostgreSQL
    dataset = create_dataset(
        db=db,
        project_id=project_id,
        file_path=dataset_path,
        gdf=gdf,
    )

    if dataset is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    return dataset