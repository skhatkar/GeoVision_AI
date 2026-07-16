import pandas as pd


def generate_gap_report(inventory):

    report = inventory.copy()

    missing_services = []
    gap_scores = []
    priority = []

    for _, row in report.iterrows():

        missing = []

        if row["Schools"] == 0:
            missing.append("School")

        if row["Hospitals"] == 0:
            missing.append("Hospital")

        if row["VetCentres"] == 0:
            missing.append("Vet Centre")

        if row["Anganwadi"] == 0:
            missing.append("Anganwadi")

        score = len(missing)

        if score == 4:
            level = "Critical"

        elif score == 3:
            level = "High"

        elif score == 2:
            level = "Medium"

        elif score == 1:
            level = "Low"

        else:
            level = "Well Served"

        missing_services.append(
            ", ".join(missing) if missing else "No Gap"
        )

        gap_scores.append(score)
        priority.append(level)

    report["Missing_Services"] = missing_services
    report["Gap_Score"] = gap_scores
    report["Priority"] = priority

    report = report.sort_values(
        by="Gap_Score",
        ascending=False
    )

    return report