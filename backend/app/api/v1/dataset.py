from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
    status,
)

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.audit_service import log_action
from app.common.request_utils import get_client_ip
from app.common.pagination import PaginationParams, PaginatedResponse
from app.core.security import get_optional_user
from app.models.user import User

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
    request: Request,
    project_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
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
            ".json",
            ".gpkg",
            ".csv",
            ".kml",
        )

        if not filename.endswith(
            allowed_extensions
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Unsupported file format. "
                    "Please upload a ZIP Shapefile, "
                    "SHP, GeoJSON (.geojson/.json), GeoPackage, or CSV."
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

        ip_address = get_client_ip(request)
        log_action(
            db,
            action="DATASET_UPLOAD",
            user_id=current_user.id if current_user else None,
            description=f"Uploaded dataset '{dataset.name}' ({dataset.feature_count} features)",
            entity_type="dataset",
            entity_id=dataset.id,
            ip_address=ip_address,
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
    response_model=PaginatedResponse[DatasetResponse],
)
def list_datasets(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(),
):
    items, total = get_datasets(
        db,
        skip=pagination.skip,
        limit=pagination.limit,
    )
    return PaginatedResponse.create(
        items=items,
        total=total,
        skip=pagination.skip,
        limit=pagination.limit,
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
    response_model=PaginatedResponse[DatasetResponse],
)
def project_datasets(
    project_id: int,
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(),
):
    items, total = get_project_datasets(
        db,
        project_id,
        skip=pagination.skip,
        limit=pagination.limit,
    )
    return PaginatedResponse.create(
        items=items,
        total=total,
        skip=pagination.skip,
        limit=pagination.limit,
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
    request: Request,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
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

    updated = update_dataset(
        db,
        dataset,
        data,
    )

    ip_address = get_client_ip(request)
    log_action(
        db,
        action="DATASET_UPDATE",
        user_id=current_user.id if current_user else None,
        description=f"Updated dataset '{updated.name}'",
        entity_type="dataset",
        entity_id=updated.id,
        ip_address=ip_address,
    )

    return updated


# =====================================================
# Delete Dataset
# =====================================================

@router.delete(
    "/{dataset_id}",
)
def remove_dataset(
    dataset_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
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

    ds_name = dataset.name
    ds_id = dataset.id

    delete_dataset(
        db,
        dataset,
    )

    ip_address = get_client_ip(request)
    log_action(
        db,
        action="DATASET_DELETE",
        user_id=current_user.id if current_user else None,
        description=f"Deleted dataset '{ds_name}' (ID: {ds_id})",
        entity_type="dataset",
        entity_id=ds_id,
        ip_address=ip_address,
    )

    return {
        "message": "Dataset deleted successfully",
    }