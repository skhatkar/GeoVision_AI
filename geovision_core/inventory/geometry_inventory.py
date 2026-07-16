import geopandas as gpd


def inventory_by_geometry(villages, assets, layer_name):
    """
    Automatically creates inventory depending on geometry type.

    Points  -> Count
    Lines   -> Length (km)
    Polygons -> Area (ha)
    """

    geometry = assets.geom_type.iloc[0]

    # -----------------------
    # POINTS
    # -----------------------

    if "Point" in geometry:

        joined = gpd.sjoin(
            assets,
            villages,
            how="inner",
            predicate="within"
        )

        result = (
            joined.groupby("Village_Na")
            .size()
            .reset_index(name=layer_name)
        )

        return result

    # -----------------------
    # LINES
    # -----------------------

    elif "Line" in geometry:

        intersection = gpd.overlay(
            assets,
            villages,
            how="intersection"
        )

        intersection["Length_km"] = (
            intersection.geometry.length / 1000
        )

        result = (
            intersection.groupby("Village_Na")["Length_km"]
            .sum()
            .reset_index()
        )

        result.rename(
            columns={
                "Length_km": f"{layer_name}_Length_km"
            },
            inplace=True
        )

        return result

    # -----------------------
    # POLYGONS
    # -----------------------

    elif "Polygon" in geometry:

        intersection = gpd.overlay(
            assets,
            villages,
            how="intersection"
        )

        intersection["Area_ha"] = (
            intersection.geometry.area / 10000
        )

        result = (
            intersection.groupby("Village_Na")["Area_ha"]
            .sum()
            .reset_index()
        )

        result.rename(
            columns={
                "Area_ha": f"{layer_name}_Area_ha"
            },
            inplace=True
        )

        return result

    else:

        return None