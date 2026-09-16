from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping

from app.models.asset import Asset


def get_administrative_hierarchy(db: Session) -> Dict[str, Any]:
    """
    Build a nested hierarchy:
    District -> Block -> Panchayat with asset counts and department breakdown.
    """
    HP_DISTRICT_CODES = {
        "16": "BILASPUR",
        "17": "CHAMBA",
        "18": "HAMIRPUR",
        "19": "KANGRA",
        "20": "KINNAUR",
        "21": "KULLU",
        "22": "LAHUL AND SPITI",
        "23": "MANDI",
        "24": "SHIMLA",
        "25": "SIRMAUR",
        "26": "SOLAN",
        "27": "UNA",
    }

    sql = text("""
        SELECT 
            COALESCE(
                NULLIF(attributes->>'district_lgd_name', ''),
                NULLIF(attributes->>'district_1', ''),
                NULLIF(attributes->>'district_name', ''),
                NULLIF(attributes->>'District', ''),
                NULLIF(attributes->>'district', ''),
                'Unknown'
            ) AS district,
            COALESCE(
                NULLIF(attributes->>'block_lgd_name', ''),
                NULLIF(attributes->>'block_lgd1', ''),
                NULLIF(attributes->>'block_name', ''),
                NULLIF(attributes->>'Block', ''),
                NULLIF(attributes->>'block', ''),
                'General / Headquarter'
            ) AS block,
            COALESCE(
                NULLIF(attributes->>'panchayat_lgd_name', ''),
                NULLIF(attributes->>'panchayat1', ''),
                NULLIF(attributes->>'panchayat_name', ''),
                NULLIF(attributes->>'Panchayat', ''),
                NULLIF(attributes->>'panchayat', ''),
                'Block Center / Urban'
            ) AS panchayat,
            COALESCE(
                NULLIF(attributes->>'department_name', ''),
                NULLIF(attributes->>'departme_1', ''),
                NULLIF(attributes->>'department_display', ''),
                'General'
            ) AS department,
            COUNT(*) AS count
        FROM assets
        WHERE attributes IS NOT NULL
        GROUP BY 1, 2, 3, 4
        ORDER BY 1, 2, 3, 4
    """)

    rows = db.execute(sql).fetchall()

    district_map: Dict[str, Any] = {}

    for row in rows:
        raw_d = str(row[0]).strip()
        # Map numeric LGD codes to proper district names if found
        district_name = HP_DISTRICT_CODES.get(raw_d, raw_d).upper()
        block_name = str(row[1]).strip()
        panchayat_name = str(row[2]).strip()
        dept_name = str(row[3]).strip()
        count = int(row[4])

        if not district_name or district_name.lower() in ("unknown", "none", "null"):
            continue

        if district_name not in district_map:
            district_map[district_name] = {
                "name": district_name,
                "total_assets": 0,
                "blocks": {},
            }

        district_node = district_map[district_name]
        district_node["total_assets"] += count

        if not block_name or block_name.lower() in ("unknown", "none", "null"):
            block_name = "General / Headquarter"

        if block_name not in district_node["blocks"]:
            district_node["blocks"][block_name] = {
                "name": block_name,
                "total_assets": 0,
                "panchayats": {},
            }

        block_node = district_node["blocks"][block_name]
        block_node["total_assets"] += count

        if not panchayat_name or panchayat_name.lower() in ("unknown", "none", "null"):
            panchayat_name = "Block Center / Urban"

        if panchayat_name not in block_node["panchayats"]:
            block_node["panchayats"][panchayat_name] = {
                "name": panchayat_name,
                "total_assets": 0,
                "departments": {},
            }

        panchayat_node = block_node["panchayats"][panchayat_name]
        panchayat_node["total_assets"] += count
        panchayat_node["departments"][dept_name] = (
            panchayat_node["departments"].get(dept_name, 0) + count
        )

    # Format into sorted lists
    districts_list = []
    for d_name in sorted(district_map.keys()):
        d_val = district_map[d_name]
        blocks_list = []
        for b_name in sorted(d_val["blocks"].keys()):
            b_val = d_val["blocks"][b_name]
            panchayats_list = []
            for p_name in sorted(b_val["panchayats"].keys()):
                p_val = b_val["panchayats"][p_name]
                panchayats_list.append({
                    "name": p_name,
                    "total_assets": p_val["total_assets"],
                    "departments": [
                        {"name": k, "count": v}
                        for k, v in sorted(p_val["departments"].items())
                    ],
                })
            blocks_list.append({
                "name": b_name,
                "total_assets": b_val["total_assets"],
                "panchayats": panchayats_list,
            })
        districts_list.append({
            "name": d_name,
            "total_assets": d_val["total_assets"],
            "blocks": blocks_list,
        })

    return {
        "total_districts": len(districts_list),
        "districts": districts_list,
    }


def filter_assets_by_hierarchy(
    db: Session,
    district: Optional[str] = None,
    block: Optional[str] = None,
    panchayat: Optional[str] = None,
    department: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Query assets matching District, Block, Panchayat, and/or Department.
    Returns GeoJSON-ready asset dictionaries with lat, lon, and full attributes.
    """
    conditions = []
    params: Dict[str, Any] = {}

    if district and district.strip():
        conditions.append("""(
            LOWER(attributes->>'district_lgd_name') = LOWER(:district)
            OR LOWER(attributes->>'district_name') = LOWER(:district)
            OR LOWER(attributes->>'district_1') = LOWER(:district)
            OR LOWER(attributes->>'District') = LOWER(:district)
            OR LOWER(attributes->>'district') = LOWER(:district)
        )""")
        params["district"] = district.strip()

    if block and block.strip() and block.strip().lower() not in ("all", "unknown", "general / headquarter"):
        conditions.append("""(
            LOWER(attributes->>'block_lgd_name') = LOWER(:block)
            OR LOWER(attributes->>'block_name') = LOWER(:block)
            OR LOWER(attributes->>'block_lgd1') = LOWER(:block)
            OR LOWER(attributes->>'Block') = LOWER(:block)
            OR LOWER(attributes->>'block') = LOWER(:block)
        )""")
        params["block"] = block.strip()

    if panchayat and panchayat.strip() and panchayat.strip().lower() not in ("all", "unknown", "block center / urban"):
        conditions.append("""(
            LOWER(attributes->>'panchayat_lgd_name') = LOWER(:panchayat)
            OR LOWER(attributes->>'panchayat_name') = LOWER(:panchayat)
            OR LOWER(attributes->>'panchayat1') = LOWER(:panchayat)
            OR LOWER(attributes->>'Panchayat') = LOWER(:panchayat)
            OR LOWER(attributes->>'panchayat') = LOWER(:panchayat)
        )""")
        params["panchayat"] = panchayat.strip()

    if department and department.strip() and department.strip().lower() != "all":
        conditions.append("""(
            LOWER(attributes->>'department_name') = LOWER(:department)
            OR LOWER(attributes->>'departme_1') = LOWER(:department)
            OR LOWER(attributes->>'department_display') = LOWER(:department)
        )""")
        params["department"] = department.strip()

    where_clause = " AND ".join(conditions) if conditions else "1=1"

    sql = text(f"""
        SELECT 
            id,
            name,
            attributes,
            layer_id,
            created_at,
            updated_at,
            ST_Y(ST_Centroid(geometry::geometry)) AS latitude,
            ST_X(ST_Centroid(geometry::geometry)) AS longitude
        FROM assets
        WHERE {where_clause}
        ORDER BY id ASC
    """)

    results = db.execute(sql, params).fetchall()

    assets_output = []
    for r in results:
        assets_output.append({
            "id": r[0],
            "name": r[1],
            "attributes": r[2] or {},
            "layer_id": r[3],
            "created_at": r[4].isoformat() if r[4] else None,
            "updated_at": r[5].isoformat() if r[5] else None,
            "latitude": float(r[6]) if r[6] is not None else None,
            "longitude": float(r[7]) if r[7] is not None else None,
        })

    return assets_output
