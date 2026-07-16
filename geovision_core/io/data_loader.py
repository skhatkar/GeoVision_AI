import geopandas as gpd


def load_layer(path):

    try:
        gdf = gpd.read_file(path)

        print(f"\nLoaded: {path}")
        print(f"Records: {len(gdf)}")

        return gdf

    except Exception as e:
        print(f"Error loading {path}")
        print(e)

        return None
    