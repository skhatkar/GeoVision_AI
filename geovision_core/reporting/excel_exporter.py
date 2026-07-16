import os
import pandas as pd


def export_excel(
    village_inventory,
    panchayat_inventory,
    gap_report,
    output_file
):

    os.makedirs(
        os.path.dirname(output_file),
        exist_ok=True
    )

    with pd.ExcelWriter(output_file) as writer:

        village_inventory.to_excel(
            writer,
            sheet_name="Village Inventory",
            index=False
        )

        panchayat_inventory.to_excel(
            writer,
            sheet_name="Panchayat Inventory",
            index=False
        )

        gap_report.to_excel(
            writer,
            sheet_name="Gap Analysis",
            index=False
        )

    print("\nExcel Report Generated Successfully")
    print(output_file)