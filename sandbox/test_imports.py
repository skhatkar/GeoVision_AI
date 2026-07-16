import importlib
import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

print("=" * 70)
print("GeoVision AI Core Validation")
print("=" * 70)

modules = [
    "geovision_core.io.data_loader",
    "geovision_core.io.asset_loader",
    "geovision_core.io.generic_asset_loader",
    "geovision_core.io.data_validator",

    "geovision_core.inventory.village_inventory",
    "geovision_core.inventory.panchayat_inventory",
    "geovision_core.inventory.spatial_inventory",
    "geovision_core.inventory.dynamic_inventory",
    "geovision_core.inventory.geometry_inventory",
    "geovision_core.inventory.asset_counter",

    "geovision_core.analysis.gap_analysis",
    "geovision_core.analysis.nearest_facility",
    "geovision_core.analysis.spatial_join",
    "geovision_core.analysis.summary_statistics",

    "geovision_core.catalog.layer_catalog",
    "geovision_core.catalog.layer_discovery",

    "geovision_core.reporting.excel_exporter",
    "geovision_core.reporting.report_generator",
    "geovision_core.reporting.map_generator"
]

passed = 0
failed = 0

for module in modules:
    try:
        importlib.import_module(module)
        print(f"✅ {module}")
        passed += 1
    except Exception as e:
        print(f"❌ {module}")
        print(f"   {type(e).__name__}: {e}")
        failed += 1

print("=" * 70)
print(f"Passed : {passed}")
print(f"Failed : {failed}")
print("=" * 70)