import pandas as pd

from geovision_core.inventory.asset_counter import count_asset_type


def build_inventory(
        villages,
        schools,
        hospitals,
        vets,
        anganwadi
):

    school_count = count_asset_type(
        villages,
        schools,
        "Schools"
    )

    hospital_count = count_asset_type(
        villages,
        hospitals,
        "Hospitals"
    )

    vet_count = count_asset_type(
        villages,
        vets,
        "VetCentres"
    )

    anganwadi_count = count_asset_type(
        villages,
        anganwadi,
        "Anganwadi"
    )

    inventory = school_count.merge(
        hospital_count,
        on="VILLAGE"
    )

    inventory = inventory.merge(
        vet_count,
        on="VILLAGE"
    )

    inventory = inventory.merge(
        anganwadi_count,
        on="VILLAGE"
    )

    inventory["Total_Assets"] = (
        inventory["Schools"]
        + inventory["Hospitals"]
        + inventory["VetCentres"]
        + inventory["Anganwadi"]
    )

    return inventory