"""
Import script to parse all sheets of assets_mapping_of_HP_Dept.xlsx
and populate Department, Dataset, Layer, and Asset records in PostgreSQL/PostGIS.
"""

import os
import math
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import SessionLocal
from app.models.department import Department
from app.models.dataset import Dataset
from app.models.layer import Layer
from app.models.asset import Asset


EXCEL_PATH = r"d:\Himachal Pradesh Work\geovision-ai\datasets\raw\assets_mapping_of_HP_Dept.xlsx"
PROJECT_ID = 3  # 'HP Government Asset Mapping'


def clean_val(v):
    if v is None:
        return None
    if isinstance(v, (float, np.floating)):
        if math.isnan(v) or math.isinf(v):
            return None
        if v.is_integer():
            return int(v)
        return float(v)
    if isinstance(v, (int, np.integer)):
        return int(v)
    if hasattr(v, "isoformat"):
        try:
            return v.isoformat()
        except:
            return str(v)
    s = str(v).strip()
    if s.lower() in ("nan", "none", "null", ""):
        return None
    return s


def sync_sequences(db):
    for tbl in ['departments', 'datasets', 'layers', 'assets', 'projects']:
        try:
            sql = f"SELECT setval(pg_get_serial_sequence('{tbl}', 'id'), coalesce(max(id), 0) + 1, false) FROM {tbl}"
            db.execute(text(sql))
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Notice syncing {tbl}: {e}")

def run_import():
    if not os.path.exists(EXCEL_PATH):
        raise FileNotFoundError(f"Excel file not found at: {EXCEL_PATH}")

    db: Session = SessionLocal()
    try:
        sync_sequences(db)
        xl = pd.ExcelFile(EXCEL_PATH)
        print(f"Found {len(xl.sheet_names)} sheets in {EXCEL_PATH}")

        # Map sheet names to standardized department names / layer titles
        sheet_to_dept = {
            "AYUSH": "AYUSH",
            "State Excise Commissioner": "State Excise",
            "DD&TG": "Digital Technologies & Governance",
            "DIRECTORATE OF PRISONS": "Prisons & Correctional Services",
            "DIRECTORATE OF WOMEN & CHILD": "Women & Child Development",
            "FISHERIES": "Fisheries",
            "HP TAKNIKI SHIKSHA BOARD": "Technical Education Board",
            "DIRECTORATE OF HEALTH": "Health & Family Welfare",
            "POLICE DEPARTMENT": "Police & Home Affairs",
            "FOREST CORPORATION": "Forest Corporation",
            "ECONOMICS AND STATISTICS": "Economics & Statistics",
            "STATE VIGILANCE BUREAU": "State Vigilance Bureau",
            "ENVIRONMENT, SCIENCE": "Environment & Science",
            "PUBLIC WORKS": "Public Works Department",
            "RURAL DEVELOPMENT": "Rural Development",
            "PANCHAYATI RAJ": "Panchayati Raj",
            "ELECTION": "Election Department",
            "TECHNICAL EDUCATION,VOCATIONAL": "Technical Education & Vocational",
            "INDUSTRIES": "Industries",
        }

        # Keep track of existing layers
        existing_layers = {
            layer.name.lower().replace(" ", "_"): layer
            for layer in db.query(Layer).all()
        }

        total_assets_imported = 0

        for sheet_name in xl.sheet_names:
            df = xl.parse(sheet_name)
            if df.empty:
                print(f"Skipping empty sheet: {sheet_name}")
                continue

            dept_display = sheet_to_dept.get(sheet_name, sheet_name.title())

            # 1. Find or create Department
            dept = db.query(Department).filter(
                (Department.name.ilike(dept_display)) | (Department.name.ilike(sheet_name))
            ).first()

            if not dept:
                dept = Department(
                    name=dept_display,
                    description=f"Department of {dept_display}",
                )
                db.add(dept)
                db.flush()

            layer_name = sheet_name.replace(" ", "_")
            normalized_key = layer_name.lower()

            # Find layer or create
            layer = existing_layers.get(normalized_key)
            if not layer:
                # Check with display name or partial
                layer = db.query(Layer).filter(
                    (Layer.name.ilike(layer_name)) | (Layer.name.ilike(sheet_name))
                ).first()

            if not layer:
                # Create dataset
                dataset = Dataset(
                    name=f"{dept_display} Assets",
                    description=f"Imported from {os.path.basename(EXCEL_PATH)} [{sheet_name}]",
                    source="Excel Sheet Ingestion",
                    file_name=os.path.basename(EXCEL_PATH),
                    file_path=EXCEL_PATH,
                    file_type="xlsx",
                    geometry_type="Point",
                    crs="EPSG:4326",
                    feature_count=len(df),
                    project_id=PROJECT_ID,
                )
                db.add(dataset)
                db.flush()

                layer = Layer(
                    name=layer_name,
                    geometry_type="Point",
                    crs="EPSG:4326",
                    feature_count=len(df),
                    file_path=EXCEL_PATH,
                    dataset_id=dataset.id,
                    department_id=dept.id,
                )
                db.add(layer)
                db.flush()
                existing_layers[normalized_key] = layer
            else:
                # Update layer feature count & department
                layer.department_id = dept.id
                layer.feature_count = len(df)
                # Clear existing assets to cleanly refresh with enriched attributes
                db.query(Asset).filter(Asset.layer_id == layer.id).delete()
                db.flush()

            # 2. Insert Assets
            assets_to_add = []
            for _, row in df.iterrows():
                raw_dict = row.to_dict()
                cleaned_attrs = {}
                for k, v in raw_dict.items():
                    cv = clean_val(v)
                    if cv is not None:
                        cleaned_attrs[str(k)] = cv

                # Extract latitude and longitude
                lat_val = (
                    cleaned_attrs.get("Latitude")
                    or cleaned_attrs.get("latitude")
                    or cleaned_attrs.get("LATITUDE")
                )
                lon_val = (
                    cleaned_attrs.get("Longitude")
                    or cleaned_attrs.get("longitude")
                    or cleaned_attrs.get("LONGITUDE")
                )

                try:
                    lat = float(lat_val) if lat_val is not None else None
                    lon = float(lon_val) if lon_val is not None else None
                except (ValueError, TypeError):
                    lat, lon = None, None

                if lat is None or lon is None or lat == 0 or lon == 0:
                    # Default to HP approximate center if missing coordinates
                    lat, lon = 31.1048, 77.1734

                # Standardize aliases so both shapefile-short and full-LGD names exist
                district = (
                    cleaned_attrs.get("district_lgd_name")
                    or cleaned_attrs.get("district_1")
                    or cleaned_attrs.get("District")
                    or cleaned_attrs.get("district")
                )
                block = (
                    cleaned_attrs.get("block_lgd_name")
                    or cleaned_attrs.get("block_lgd1")
                    or cleaned_attrs.get("Block")
                    or cleaned_attrs.get("block")
                )
                panchayat = (
                    cleaned_attrs.get("panchayat_lgd_name")
                    or cleaned_attrs.get("panchayat1")
                    or cleaned_attrs.get("Panchayat")
                    or cleaned_attrs.get("panchayat")
                )
                village = (
                    cleaned_attrs.get("village_lgd_name")
                    or cleaned_attrs.get("village__1")
                    or cleaned_attrs.get("Village")
                )
                dept_name = (
                    cleaned_attrs.get("department_name")
                    or cleaned_attrs.get("departme_1")
                    or dept_display
                )
                asset_name = (
                    cleaned_attrs.get("asset_name")
                    or cleaned_attrs.get("office_name")
                    or f"{dept_display} Asset"
                )
                asset_address = (
                    cleaned_attrs.get("asset_address")
                    or cleaned_attrs.get("asset_addr")
                    or ""
                )

                # Enrich attributes with unified canonical keys
                enriched_attrs = {
                    **cleaned_attrs,
                    "district_lgd_name": district,
                    "district_name": district,
                    "district": district,
                    "district_1": district,
                    "block_lgd_name": block,
                    "block_name": block,
                    "block": block,
                    "block_lgd1": block,
                    "panchayat_lgd_name": panchayat,
                    "panchayat_name": panchayat,
                    "panchayat": panchayat,
                    "panchayat1": panchayat,
                    "village_lgd_name": village,
                    "department_name": dept_name,
                    "department_display": dept_display,
                    "asset_name": asset_name,
                    "asset_address": asset_address,
                    "latitude": lat,
                    "longitude": lon,
                }

                geom_wkt = f"SRID=4326;POINT({lon} {lat})"

                asset = Asset(
                    name=str(asset_name)[:250],
                    geometry=geom_wkt,
                    attributes=enriched_attrs,
                    layer_id=layer.id,
                )
                assets_to_add.append(asset)

            db.bulk_save_objects(assets_to_add)
            db.commit()
            total_assets_imported += len(assets_to_add)
            print(f"Sheet '{sheet_name}': imported {len(assets_to_add)} assets into layer '{layer.name}' (ID: {layer.id})")

        print(f"\nSUCCESS! Total {total_assets_imported} assets imported across {len(xl.sheet_names)} department layers.")

    except Exception as e:
        db.rollback()
        print(f"Error during import: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_import()
