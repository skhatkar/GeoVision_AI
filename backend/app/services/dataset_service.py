import os
import shutil
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.dataset import Dataset


UPLOAD_FOLDER = Path("uploads")


def save_dataset(
    db: Session,
    file: UploadFile,
    project_id: int,
):

    extension = file.filename.split(".")[-1].lower()

    folder_map = {
        "zip": "shapefiles",
        "geojson": "geojson",
        "json": "geojson",
        "csv": "csv",
        "xlsx": "excel",
        "xls": "excel",
        "kml": "kml",
    }

    if extension not in folder_map:
        raise ValueError("Unsupported file type")

    save_folder = UPLOAD_FOLDER / folder_map[extension]
    save_folder.mkdir(parents=True, exist_ok=True)

    file_path = save_folder / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    dataset = Dataset(
        name=file.filename.rsplit(".", 1)[0],
        filename=file.filename,
        file_type=extension,
        file_path=str(file_path),
        feature_count=0,
        geometry_type=None,
        crs=None,
        project_id=project_id,
    )

    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    return dataset