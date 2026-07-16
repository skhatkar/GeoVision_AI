import geopandas as gpd


def find_nearest_facility(villages, facilities, facility_name_field):
    """
    Finds the nearest facility for each village.
    Returns the nearest facility name and distance in kilometers.
    """

    # Project to a metric CRS
    villages_proj = villages.to_crs(epsg=32643)
    facilities_proj = facilities.to_crs(epsg=32643)

    # Find nearest facility
    nearest = gpd.sjoin_nearest(
        villages_proj,
        facilities_proj,
        how="left",
        distance_col="Distance_m"
    )

    # Convert meters to kilometers
    nearest["Distance_km"] = nearest["Distance_m"] / 1000

    # Keep useful columns
    result = nearest[
        [
            "VILLAGE",
            facility_name_field,
            "Distance_km"
        ]
    ].copy()

    result.rename(
        columns={
            facility_name_field: "Nearest_Facility"
        },
        inplace=True
    )

    return result
