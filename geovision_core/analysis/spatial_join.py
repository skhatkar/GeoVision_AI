import geopandas as gpd


def spatial_join_assets(villages, assets):
    """
    Assign each asset to its containing village.

    Parameters
    ----------
    villages : GeoDataFrame
        Village polygons.

    assets : GeoDataFrame
        Asset point layer.

    Returns
    -------
    GeoDataFrame
        Assets with village attributes.
    """

    joined = gpd.sjoin(
        assets,
        villages,
        how="left",
        predicate="within"
    )

    return joined