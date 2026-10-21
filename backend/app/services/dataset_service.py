import os
import shutil
import zipfile

os.environ["SHAPE_RESTORE_SHX"] = "YES"

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

def save_uploaded_file(
    file: UploadFile,
):

    upload_dir = settings.UPLOAD_FOLDER

    os.makedirs(
        upload_dir,
        exist_ok=True,
    )

    original_filename = (
        file.filename or "uploaded_file"
    )

    # Prevent accidental path traversal
    filename = os.path.basename(
        original_filename
    )

    file_path = os.path.join(
        upload_dir,
        filename,
    )

    # If file already exists, create a unique name
    if os.path.exists(file_path):

        name, extension = os.path.splitext(
            filename
        )

        counter = 1

        while os.path.exists(file_path):

            new_filename = (
                f"{name}_{counter}{extension}"
            )

            file_path = os.path.join(
                upload_dir,
                new_filename,
            )

            counter += 1

    with open(
        file_path,
        "wb",
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer,
        )

    print(
        f"Uploaded file saved to: {file_path}"
    )

    return file_path


# =====================================================
# Extract ZIP
# =====================================================

def extract_zip(
    zip_path: str,
):

    if not zipfile.is_zipfile(zip_path):

        raise ValueError(
            "Uploaded file is not a valid ZIP archive."
        )

    base_name = os.path.splitext(
        zip_path
    )[0]

    extract_folder = (
        base_name + "_extracted"
    )

    os.makedirs(
        extract_folder,
        exist_ok=True,
    )

    with zipfile.ZipFile(
        zip_path,
        "r",
    ) as zip_ref:

        # -----------------------------------------
        # Security check
        # -----------------------------------------

        base_dir = os.path.abspath(
            extract_folder
        )

        for member in zip_ref.infolist():

            member_path = os.path.abspath(
                os.path.join(
                    extract_folder,
                    member.filename,
                )
            )

            if not member_path.startswith(
                base_dir + os.sep
            ):

                raise ValueError(
                    "Unsafe ZIP archive detected."
                )

        zip_ref.extractall(
            extract_folder
        )

    print(
        f"ZIP extracted to: {extract_folder}"
    )

    return extract_folder


# =====================================================
# Find Shapefile
# =====================================================

def find_shapefile(
    folder: str,
):

    shapefiles = []

    for root, _, files in os.walk(folder):

        for filename in files:

            if filename.lower().endswith(
                ".shp"
            ):

                shapefiles.append(
                    os.path.join(
                        root,
                        filename,
                    )
                )

    if not shapefiles:
        return None

    # Prefer the first valid shapefile
    shapefiles.sort()

    print(
        "Shapefiles found:"
    )

    for shp in shapefiles:
        print(
            f"  - {shp}"
        )

    return shapefiles[0]


# =====================================================
# Read Dataset
# =====================================================

def read_dataset(
    path: str,
):

    print(
        f"Reading GIS dataset: {path}"
    )

    if path.lower().endswith(".csv"):
        import pandas as pd
        df = pd.read_csv(path)
        if df.empty:
            raise ValueError("The uploaded CSV file contains no rows.")
        
        # Check for lat/lon columns
        lat_col = next((c for c in df.columns if c.lower() in ["latitude", "lat", "y"]), None)
        lon_col = next((c for c in df.columns if c.lower() in ["longitude", "lon", "lng", "long", "x"]), None)
        
        if lat_col and lon_col:
            # Clean numeric lat/long
            df[lat_col] = pd.to_numeric(df[lat_col], errors="coerce")
            df[lon_col] = pd.to_numeric(df[lon_col], errors="coerce")
            df = df.dropna(subset=[lat_col, lon_col])
            if df.empty:
                raise ValueError("CSV contains no valid latitude/longitude coordinate rows.")
            gdf = gpd.GeoDataFrame(
                df,
                geometry=gpd.points_from_xy(df[lon_col], df[lat_col]),
                crs="EPSG:4326"
            )
        elif any(c.lower() in ["geometry", "wkt", "the_geom"] for c in df.columns):
            from shapely import wkt
            geom_col = next(c for c in df.columns if c.lower() in ["geometry", "wkt", "the_geom"])
            df["geometry"] = df[geom_col].apply(lambda v: wkt.loads(str(v)) if pd.notna(v) else None)
            gdf = gpd.GeoDataFrame(df, geometry="geometry", crs="EPSG:4326")
        else:
            raise ValueError(
                "CSV must contain latitude and longitude columns (e.g. 'lat', 'lon', 'latitude', 'longitude') or a 'geometry' WKT column."
            )
    else:
        import fiona
        os.environ["SHAPE_RESTORE_SHX"] = "YES"
        try:
            with fiona.Env(SHAPE_RESTORE_SHX="YES"):
                gdf = gpd.read_file(path)
        except Exception as read_err:
            print(f"Standard read attempt failed: {read_err}. Trying fallback...")
            try:
                gdf = gpd.read_file(path, engine="pyogrio")
            except Exception:
                gdf = gpd.read_file(path)

    if gdf.empty:

        raise ValueError(
            "The uploaded GIS dataset contains no features."
        )

    print(
        f"Features loaded: {len(gdf)}"
    )

    print(
        f"Original CRS: {gdf.crs}"
    )

    print(
        f"Geometry types: "
        f"{gdf.geometry.geom_type.unique().tolist()}"
    )

    # -----------------------------------------
    # Validate geometry column
    # -----------------------------------------

    if "geometry" not in gdf.columns:

        raise ValueError(
            "The uploaded dataset does not contain geometry."
        )

    # -----------------------------------------
    # Remove null geometries
    # -----------------------------------------

    gdf = gdf[
        gdf.geometry.notna()
    ].copy()

    gdf = gdf[
        ~gdf.geometry.is_empty
    ].copy()

    if gdf.empty:

        raise ValueError(
            "The uploaded dataset contains no valid geometries."
        )

    # -----------------------------------------
    # CRS handling
    # -----------------------------------------

    if gdf.crs is None:

        print(
            "WARNING: Dataset has no CRS."
        )

        # We assume WGS84 if CRS is missing.
        gdf = gdf.set_crs(
            epsg=4326,
            allow_override=True,
        )

    elif gdf.crs.to_epsg() != 4326:

        print(
            f"Reprojecting "
            f"{gdf.crs} -> EPSG:4326"
        )

        gdf = gdf.to_crs(
            epsg=4326
        )

    else:

        print(
            "Dataset already uses EPSG:4326"
        )

    # -----------------------------------------
    # Fix invalid geometries where possible
    # -----------------------------------------

    try:

        invalid = (
            ~gdf.geometry.is_valid
        ).sum()

        if invalid:

            print(
                f"Found {invalid} invalid geometries."
            )

            gdf["geometry"] = (
                gdf.geometry.make_valid()
            )

    except Exception as e:

        print(
            f"Geometry validation warning: {e}"
        )

    # -----------------------------------------
    # Final cleanup
    # -----------------------------------------

    gdf = gdf[
        gdf.geometry.notna()
    ].copy()

    gdf = gdf[
        ~gdf.geometry.is_empty
    ].copy()

    if gdf.empty:

        raise ValueError(
            "No valid geometries remain after processing."
        )

    print(
        f"Final feature count: {len(gdf)}"
    )

    print(
        f"Final CRS: {gdf.crs}"
    )

    return gdf


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

    print(
        "\n========== create_dataset() =========="
    )

    # -----------------------------------------
    # Verify project
    # -----------------------------------------

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id
        )
        .first()
    )

    if project is None:

        return None

    # -----------------------------------------
    # Determine geometry type
    # -----------------------------------------

    geometry_type = None

    if not gdf.empty:

        geometry_types = (
            gdf.geometry
            .geom_type
            .dropna()
            .unique()
            .tolist()
        )

        if geometry_types:

            if len(geometry_types) == 1:

                geometry_type = (
                    geometry_types[0]
                )

            else:

                geometry_type = (
                    "Mixed"
                )

    # -----------------------------------------
    # CRS
    # -----------------------------------------

    crs = (
        str(gdf.crs)
        if gdf.crs
        else "EPSG:4326"
    )

    # -----------------------------------------
    # Create Dataset
    # -----------------------------------------

    dataset = Dataset(

        name=os.path.splitext(
            os.path.basename(
                file_path
            )
        )[0],

        description=None,

        source="Uploaded",

        file_name=os.path.basename(
            file_path
        ),

        file_path=file_path,

        file_type=(
            os.path.splitext(
                file_path
            )[1]
            .replace(".", "")
            .lower()
        ),

        geometry_type=geometry_type,

        crs=crs,

        feature_count=len(gdf),

        project_id=project_id,
    )

    try:

        db.add(dataset)

        db.flush()

        print(
            f"Dataset created: ID={dataset.id}"
        )

        # -----------------------------------------
        # Create Layer
        # -----------------------------------------

        layer = create_layer(
            db,
            dataset,
        )

        if layer is None:

            raise ValueError(
                "No department found. "
                "Please create at least one department "
                "before uploading a dataset."
            )

        print(
            f"Layer created: ID={layer.id}"
        )

        # -----------------------------------------
        # Create Assets
        # -----------------------------------------

        asset_count = bulk_create_assets(
            db=db,
            layer=layer,
            gdf=gdf,
        )

        print(
            f"Assets created: {asset_count}"
        )

        # -----------------------------------------
        # Final commit
        # -----------------------------------------

        db.commit()

        db.refresh(
            dataset
        )

        print(
            "Dataset transaction committed successfully."
        )

        return dataset

    except Exception as e:

        db.rollback()

        print(
            "\n========== DATASET CREATION ERROR =========="
        )

        print(
            repr(e)
        )

        print(
            "============================================\n"
        )

        raise


# =====================================================
# Get All Datasets
# =====================================================

def get_datasets(
    db: Session,
    skip: int = 0,
    limit: int = 50,
):
    query = db.query(Dataset)
    total = query.count()
    items = (
        query.order_by(
            Dataset.created_at.desc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items, total


# =====================================================
# Get Dataset
# =====================================================

def get_dataset(
    db: Session,
    dataset_id: int,
):

    return (
        db.query(Dataset)
        .filter(
            Dataset.id == dataset_id
        )
        .first()
    )


# =====================================================
# Delete Dataset
# =====================================================

def delete_dataset(
    db: Session,
    dataset: Dataset,
):

    try:

        db.delete(
            dataset
        )

        db.commit()

    except Exception:

        db.rollback()
        raise


# =====================================================
# Get Project Datasets
# =====================================================

def get_project_datasets(
    db: Session,
    project_id: int,
    skip: int = 0,
    limit: int = 50,
):
    query = db.query(Dataset).filter(Dataset.project_id == project_id)
    total = query.count()
    items = (
        query.order_by(
            Dataset.created_at.desc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items, total


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

        dataset.description = (
            data.description
        )

    if data.source is not None:

        dataset.source = data.source

    try:

        db.commit()

        db.refresh(
            dataset
        )

    except Exception:

        db.rollback()
        raise

    return dataset