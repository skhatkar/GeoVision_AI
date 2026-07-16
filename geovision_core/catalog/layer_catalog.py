import os
from datetime import datetime

import geopandas as gpd
import pandas as pd


def build_catalog(layers):

    records = []

    for layer in layers:

        gdf = gpd.read_file(layer["path"])

        geometry_types = ", ".join(
            sorted(gdf.geom_type.unique())
        )

        bounds = gdf.total_bounds

        last_modified = datetime.fromtimestamp(
            os.path.getmtime(layer["path"])
        ).strftime("%Y-%m-%d %H:%M")

        records.append({

            "Category": layer["category"],

            "Department": layer["department"],

            "Layer": layer["layer_name"],

            "Geometry": gdf.geom_type.iloc[0],

            "Geometry_Types": geometry_types,

            "CRS": str(gdf.crs),

            "Features": len(gdf),

            "Columns": len(gdf.columns),

            "File_Size_KB": round(
                os.path.getsize(layer["path"]) / 1024,
                2
            ),

            "Bounds": tuple(round(x, 5) for x in bounds),

            "Last_Modified": last_modified,

            "Source_Folder": os.path.dirname(layer["path"])

        })

    return pd.DataFrame(records)