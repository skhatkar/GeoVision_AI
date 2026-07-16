from geovision_core.analysis.spatial_join import spatial_join_assets

def count_asset_type(villages, assets, asset_name):

    joined = spatial_join_assets(
        villages,
        assets
    )

    counts = (
        joined.groupby("VILLAGE")
        .size()
        .reset_index(name=asset_name)
    )

    result = villages[["VILLAGE"]].merge(
        counts,
        on="VILLAGE",
        how="left"
    )

    result[asset_name] = (
        result[asset_name]
        .fillna(0)
        .astype(int)
    )

    return result