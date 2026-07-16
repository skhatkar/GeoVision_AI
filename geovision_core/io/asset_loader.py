import os

from geovision_core.io.data_loader import load_layer


def load_department_layers(discovered_layers):
    """
    Loads every department layer discovered by layer_discovery.py

    Returns:

    {
        "Education": {
            "Higher_education": GeoDataFrame,
            "technical_education": GeoDataFrame
        },
        "Health": {
            "Hospital": GeoDataFrame
        }
    }
    """

    departments = {}

    for layer in discovered_layers:

        # Ignore non-department layers
        if layer["category"] != "departments":
            continue

        department = layer["department"]
        layer_name = layer["layer_name"]
        layer_path = layer["path"]

        if department not in departments:
            departments[department] = {}

        departments[department][layer_name] = load_layer(layer_path)

    return departments