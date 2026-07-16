import pandas as pd
import geopandas as gpd


def build_dynamic_inventory(villages, department_layers):

    # Base inventory
    inventory = villages[["Village_Na"]].copy()

    inventory.rename(
        columns={
            "Village_Na": "Village"
        },
        inplace=True
    )

    # -----------------------------
    # Loop through every department
    # -----------------------------

    for department in department_layers:

        for layer_name, layer in department_layers[department].items():

            joined = gpd.sjoin(
                layer,
                villages,
                how="left",
                predicate="within"
            )

            counts = (
                joined
                .groupby("Village_Na")
                .size()
                .reset_index(name=layer_name)
            )

            inventory = inventory.merge(
                counts,
                left_on="Village",
                right_on="Village_Na",
                how="left"
            )

            inventory.drop(
                columns=["Village_Na"],
                inplace=True
            )

            inventory[layer_name] = (
                inventory[layer_name]
                .fillna(0)
                .astype(int)
            )

    # -----------------------------
    # Total Assets
    # -----------------------------

    asset_columns = inventory.columns[1:]

    inventory["Total_Assets"] = (
        inventory[asset_columns]
        .sum(axis=1)
    )

    return inventory