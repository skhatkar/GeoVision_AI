import os

from geovision_core.io.data_loader import load_layer


SUPPORTED_FORMATS = (".shp", ".geojson", ".gpkg")


def load_all_departments(source_folder):
    """
    Automatically loads every GIS layer present under
    data/source_data/departments/

    Returns
    -------
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

    department_layers = {}

    departments_path = os.path.join(
        source_folder,
        "departments"
    )

    if not os.path.exists(departments_path):
        return department_layers

    for department in sorted(os.listdir(departments_path)):

        department_path = os.path.join(
            departments_path,
            department
        )

        if not os.path.isdir(department_path):
            continue

        layers = {}

        for file in sorted(os.listdir(department_path)):

            if file.lower().endswith(SUPPORTED_FORMATS):

                layer_path = os.path.join(
                    department_path,
                    file
                )

                layer_name = os.path.splitext(file)[0]

                layers[layer_name] = load_layer(layer_path)

        if layers:
            department_layers[department] = layers

    return department_layers