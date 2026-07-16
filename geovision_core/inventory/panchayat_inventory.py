import pandas as pd


def build_panchayat_inventory(village_inventory, villages):

    merged = village_inventory.merge(

        villages[
            [
                "VILLAGE",
                "PANCHAYAT"
            ]
        ],

        on="VILLAGE",
        how="left"

    )

    result = (

        merged

        .groupby("PANCHAYAT")

        [

            [

                "Schools",
                "Hospitals",
                "VetCentres",
                "Anganwadi",
                "Total_Assets"

            ]

        ]

        .sum()

        .reset_index()

    )

    result = result.sort_values(

        by="Total_Assets",

        ascending=False

    )

    return result