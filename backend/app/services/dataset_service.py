import os
import shutil
import zipfile

import geopandas as gpd

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.dataset import Dataset
from app.models.project import Project
from app.services.layer_service import create_layer
from app.services.asset_service import bulk_create_assets


# =====================================================
# Save Uploaded File
# =====================================================

def save_uploaded_file(file: UploadFile):

    upload_dir = settings.UPLOAD_FOLDER

    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


# =====================================================
# Extract ZIP
# =====================================================

def extract_zip(zip_path: str):

    extract_folder = os.path.splitext(zip_path)[0]

    os.makedirs(extract_folder, exist_ok=True)

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(extract_folder)

    return extract_folder


# =====================================================
# Find Shapefile
# =====================================================

def find_shapefile(folder: str):

    for root, _, files in os.walk(folder):

        for file in files:

            if file.lower().endswith(".shp"):

                return os.path.join(root, file)

    return None


# =====================================================
# Read Dataset
# =====================================================

def read_dataset(path: str):

    return gpd.read_file(path)


# =====================================================
# Create Dataset
# =====================================================

def create_dataset(
    db: Session,
    *,
    project_id: int,
    file_path: str,
    gdf: gpd.GeoDataFrame,
):

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if project is None:
        return None

    dataset = Dataset(
        name=os.path.splitext(os.path.basename(file_path))[0],
        description=None,
        source="Uploaded",

        file_name=os.path.basename(file_path),
        file_path=file_path,
        file_type=os.path.splitext(file_path)[1].replace(".", ""),

        geometry_type=(
            gdf.geometry.geom_type.iloc[0]
            if not gdf.empty
            else None
        ),

        crs=str(gdf.crs) if gdf.crs else None,

        feature_count=len(gdf),

        project_id=project_id,
    )

    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    # -----------------------------------
    # Automatically Create Layer
    # -----------------------------------

    layer = create_layer(
        db,
        dataset,
    )

    if layer is None:
        raise Exception(
            "No department found. Create at least one department first."
        )
    

    print("=" * 60)
    print("Calling bulk_create_assets")
    print("Layer ID:", layer.id)
    print("Features:", len(gdf))
    print("=" * 60)

    # -----------------------------------
    # Automatically Create Assets
    # -----------------------------------

    bulk_create_assets(
        db=db,
        layer=layer,
        gdf=gdf,
    )

    return dataset




# =====================================================
# Get All Datasets
# =====================================================

def get_datasets(db: Session):

    return (
        db.query(Dataset)
        .order_by(Dataset.created_at.desc())
        .all()
    )


# =====================================================
# Get Dataset
# =====================================================

def get_dataset(
    db: Session,
    dataset_id: int,
):

    return (
        db.query(Dataset)
        .filter(Dataset.id == dataset_id)
        .first()
    )


# =====================================================
# Delete Dataset
# =====================================================

def delete_dataset(
    db: Session,
    dataset: Dataset,
):

    db.delete(dataset)
    db.commit()


# =====================================================
# Get Project Datasets
# =====================================================

def get_project_datasets(
    db: Session,
    project_id: int,
):

    return (
        db.query(Dataset)
        .filter(
            Dataset.project_id == project_id
        )
        .order_by(
            Dataset.created_at.desc()
        )
        .all()
    )



# =====================================================
# Update Dataset
# =====================================================

def update_dataset(
    db: Session,
    dataset: Dataset,
    data,
):

    if data.name is not None:
        dataset.name = data.name


    if data.description is not None:
        dataset.description = data.description


    if data.source is not None:
        dataset.source = data.source


    db.commit()

    db.refresh(dataset)

    return dataset