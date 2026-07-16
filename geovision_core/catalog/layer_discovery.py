from pathlib import Path
from unicodedata import category


def discover_layers(root_folder):
    """
    Discover all shapefiles under the source_data directory.

    Returns a list of dictionaries containing:
        - department
        - layer_name
        - path
    """

    layers = []

    root = Path(root_folder)

    for shp in root.rglob("*.shp"):

        relative = shp.relative_to(root)

        parts = relative.parts
        category = parts[0]

        if category == "departments":
            department = parts[1]
        else:
            department = category

        layers.append(
            {
                "category": category,
                "department": department,
                "layer_name": shp.stem,
                "path": str(shp)
            }
        )

    return layers
