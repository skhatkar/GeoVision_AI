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

from app.schemas.dataset import (
    DatasetResponse,
    DatasetUpdate,
)

from app.services.dataset_service import (

    save_uploaded_file,
    extract_zip,
    find_shapefile,
    read_dataset,
    create_dataset,

    get_datasets,
    get_dataset,
    get_project_datasets,
    update_dataset,
    delete_dataset,
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

@router.get(
    "",
    response_model=list[DatasetResponse]
)
def list_datasets(
    db: Session = Depends(get_db)
):

    return get_datasets(db)


@router.get(
    "/{dataset_id}",
    response_model=DatasetResponse
)
def dataset_details(
    dataset_id:int,
    db:Session = Depends(get_db)
):

    dataset = get_dataset(
        db,
        dataset_id
    )


    if dataset is None:

        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )


    return dataset


@router.get(
    "/project/{project_id}",
    response_model=list[DatasetResponse]
)
def project_datasets(
    project_id:int,
    db:Session = Depends(get_db)
):

    return get_project_datasets(
        db,
        project_id
    )


@router.patch(
    "/{dataset_id}",
    response_model=DatasetResponse
)
def edit_dataset(
    dataset_id:int,
    data:DatasetUpdate,
    db:Session=Depends(get_db)
):

    dataset = get_dataset(
        db,
        dataset_id
    )


    if dataset is None:

        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )


    return update_dataset(
        db,
        dataset,
        data
    )


@router.delete(
    "/{dataset_id}"
)
def remove_dataset(
    dataset_id:int,
    db:Session=Depends(get_db)
):

    dataset = get_dataset(
        db,
        dataset_id
    )


    if dataset is None:

        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )


    delete_dataset(
        db,
        dataset
    )


    return {
        "message":"Dataset deleted successfully"
    }