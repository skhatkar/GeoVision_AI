import geopandas as gpd

from geovision_core.common.validation_rules import REQUIRED_FIELDS


def validate_layer(layer_name, layer_path):

    gdf = gpd.read_file(layer_path)

    # -------------------------------------------------
    # CRS Check
    # -------------------------------------------------

    has_crs = gdf.crs is not None

    if has_crs:
        try:
            epsg = gdf.crs.to_epsg()

            if epsg:
                crs_display = f"EPSG:{epsg}"
            else:
                crs_display = gdf.crs.name or gdf.crs.to_string()

        except Exception:
            crs_display = str(gdf.crs)

    else:
        crs_display = "Unknown"

    # -------------------------------------------------
    # Empty Geometries
    # -------------------------------------------------

    empty_geom = int(gdf.geometry.is_empty.sum())

    # -------------------------------------------------
    # Invalid Geometries
    # -------------------------------------------------

    invalid_geom = int((~gdf.is_valid).sum())

    # -------------------------------------------------
    # Duplicate Geometries
    # -------------------------------------------------

    duplicate_geom = int(gdf.geometry.duplicated().sum())

    # -------------------------------------------------
    # Geometry Types
    # -------------------------------------------------

    geometry_types = ", ".join(sorted(gdf.geom_type.unique()))

    # -------------------------------------------------
    # Missing Attribute Values
    # -------------------------------------------------

    missing_values = int(
        gdf.drop(columns="geometry", errors="ignore")
        .isnull()
        .sum()
        .sum()
    )

    # -------------------------------------------------
    # Required Field Validation
    # -------------------------------------------------

    required_fields = REQUIRED_FIELDS.get(layer_name, [])

    missing_required_fields = [
        field
        for field in required_fields
        if field not in gdf.columns
    ]

    # -------------------------------------------------
    # Validation Status
    # -------------------------------------------------

    if not has_crs:
        status = "ERROR"

    elif len(missing_required_fields) > 0:
        status = "ERROR"

    elif (
        invalid_geom > 0
        or empty_geom > 0
        or duplicate_geom > 0
    ):
        status = "WARNING"

    else:
        status = "OK"

    # -------------------------------------------------
    # Return Validation Report
    # -------------------------------------------------

    return {
        "Layer": layer_name,
        "Status": status,
        "CRS": crs_display,
        "Features": len(gdf),
        "Geometry_Type": geometry_types,
        "Empty_Geometries": empty_geom,
        "Invalid_Geometries": invalid_geom,
        "Duplicate_Geometries": duplicate_geom,
        "Missing_Attributes": missing_values,
        "Missing_Required_Fields": (
            ", ".join(missing_required_fields)
            if missing_required_fields
            else "None"
        ),
    }