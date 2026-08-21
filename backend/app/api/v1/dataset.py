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


# =====================================================
# Upload Dataset
# =====================================================

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

    saved_file = None

    try:

        # -----------------------------------------
        # Validate filename
        # -----------------------------------------

        if not file.filename:

            raise HTTPException(
                status_code=400,
                detail="No file was uploaded.",
            )

        filename = file.filename.lower()

        allowed_extensions = (
            ".zip",
            ".shp",
            ".geojson",
            ".gpkg",
        )

        if not filename.endswith(
            allowed_extensions
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Unsupported file format. "
                    "Please upload a ZIP Shapefile, "
                    "SHP, GeoJSON, or GeoPackage."
                ),
            )

        print(
            "\n=========================================="
        )

        print(
            "DATASET UPLOAD STARTED"
        )

        print(
            f"Filename   : {file.filename}"
        )

        print(
            f"Project ID : {project_id}"
        )

        print(
            "==========================================\n"
        )

        # -----------------------------------------
        # Save uploaded file
        # -----------------------------------------

        saved_file = save_uploaded_file(
            file
        )

        # -----------------------------------------
        # ZIP Shapefile
        # -----------------------------------------

        if saved_file.lower().endswith(
            ".zip"
        ):

            extract_folder = extract_zip(
                saved_file
            )

            shp_file = find_shapefile(
                extract_folder
            )

            if shp_file is None:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "No .shp file was found "
                        "inside the uploaded ZIP."
                    ),
                )

            dataset_path = shp_file

        else:

            dataset_path = saved_file

        print(
            f"Dataset path: {dataset_path}"
        )

        # -----------------------------------------
        # Read GIS dataset
        # -----------------------------------------

        try:

            gdf = read_dataset(
                dataset_path
            )

        except Exception as e:

            print(
                "\n========== GIS READ ERROR =========="
            )

            print(
                repr(e)
            )

            print(
                "====================================\n"
            )

            raise HTTPException(
                status_code=400,
                detail=(
                    "Unable to read the GIS dataset. "
                    f"Reason: {str(e)}"
                ),
            )

        # -----------------------------------------
        # Create Dataset + Layer + Assets
        # -----------------------------------------

        try:

            dataset = create_dataset(
                db=db,
                project_id=project_id,
                file_path=dataset_path,
                gdf=gdf,
            )

        except Exception as e:

            db.rollback()

            print(
                "\n========== DATABASE UPLOAD ERROR =========="
            )

            print(
                repr(e)
            )

            print(
                "============================================\n"
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Dataset was read successfully, "
                    "but could not be saved to PostgreSQL. "
                    f"Reason: {str(e)}"
                ),
            )

        if dataset is None:

            raise HTTPException(
                status_code=404,
                detail=(
                    f"Project {project_id} was not found."
                ),
            )

        print(
            "\n=========================================="
        )

        print(
            "DATASET UPLOAD SUCCESSFUL"
        )

        print(
            f"Dataset ID : {dataset.id}"
        )

        print(
            f"Features   : {dataset.feature_count}"
        )

        print(
            "==========================================\n"
        )

        return dataset

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        print(
            "\n========== UNEXPECTED UPLOAD ERROR =========="
        )

        print(
            repr(e)
        )

        print(
            "==============================================\n"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Unexpected upload error: {str(e)}"
            ),
        )


# =====================================================
# Get All Datasets
# =====================================================

@router.get(
    "",
    response_model=list[DatasetResponse],
)
def list_datasets(
    db: Session = Depends(get_db),
):

    return get_datasets(
        db
    )


# =====================================================
# Get Dataset
# =====================================================

@router.get(
    "/{dataset_id}",
    response_model=DatasetResponse,
)
def dataset_details(
    dataset_id: int,
    db: Session = Depends(get_db),
):

    dataset = get_dataset(
        db,
        dataset_id,
    )

    if dataset is None:

        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    return dataset


# =====================================================
# Get Project Datasets
# =====================================================

@router.get(
    "/project/{project_id}",
    response_model=list[DatasetResponse],
)
def project_datasets(
    project_id: int,
    db: Session = Depends(get_db),
):

    return get_project_datasets(
        db,
        project_id,
    )


# =====================================================
# Update Dataset
# =====================================================

@router.patch(
    "/{dataset_id}",
    response_model=DatasetResponse,
)
def edit_dataset(
    dataset_id: int,
    data: DatasetUpdate,
    db: Session = Depends(get_db),
):

    dataset = get_dataset(
        db,
        dataset_id,
    )

    if dataset is None:

        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    return update_dataset(
        db,
        dataset,
        data,
    )


# =====================================================
# Delete Dataset
# =====================================================

@router.delete(
    "/{dataset_id}",
)
def remove_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
):

    dataset = get_dataset(
        db,
        dataset_id,
    )

    if dataset is None:

        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    delete_dataset(
        db,
        dataset,
    )

    return {
        "message": "Dataset deleted successfully",
    }