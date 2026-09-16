import type { FilteredAsset } from "@/api/assetApi";

/**
 * Clean string formatting for CSV cell content.
 * Handles escaping quotes and wrapping in quotes if needed.
 */
function formatCSVCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generate a descriptive, timestamped filename based on current filter selections.
 */
export function generateExportFilename(
  district?: string,
  block?: string,
  panchayat?: string,
  department?: string,
  extension: "csv" | "geojson" | "json" = "csv"
): string {
  const parts: string[] = ["assets"];
  if (district) parts.push(district.replace(/[^a-zA-Z0-9]/g, "_"));
  if (block) parts.push(block.replace(/[^a-zA-Z0-9]/g, "_"));
  if (panchayat) parts.push(panchayat.replace(/[^a-zA-Z0-9]/g, "_"));
  if (department) parts.push(department.replace(/[^a-zA-Z0-9]/g, "_"));

  const dateStr = new Date().toISOString().split("T")[0];
  parts.push(dateStr);
  return `${parts.join("_")}.${extension}`;
}

/**
 * Triggers a browser download of a Blob file.
 */
function downloadBlob(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export assets list to CSV format.
 */
export function exportAssetsToCSV(assets: FilteredAsset[], filename?: string) {
  if (assets.length === 0) return;

  // Determine standard headers
  const standardHeaders = [
    "Asset ID",
    "Asset Name",
    "Department",
    "Asset Type",
    "District",
    "Block",
    "Panchayat",
    "Village",
    "Address",
    "PIN Code",
    "Latitude",
    "Longitude",
    "Mobile Number",
    "Official Email",
    "Ownership Type",
    "Status",
    "Area",
    "Layer Name",
  ];

  // Collect all additional raw attribute keys across all assets
  const extraKeysSet = new Set<string>();
  const STANDARD_ATTR_KEYS = new Set([
    "asset_name", "office_name", "department_name", "department_display", "departme_1",
    "asset_type_name", "asset_ty_1", "district_lgd_name", "district_1",
    "block_lgd_name", "block_lgd1", "panchayat_lgd_name", "panchayat1",
    "village_lgd_name", "village__1", "asset_address", "asset_addr", "pincode",
    "mobile_number", "mobile_num", "official_email", "official_e",
    "ownership_type", "ownership_", "asset_status", "asset_area"
  ]);

  for (const asset of assets) {
    if (asset.attributes) {
      for (const k of Object.keys(asset.attributes)) {
        if (!STANDARD_ATTR_KEYS.has(k)) {
          extraKeysSet.add(k);
        }
      }
    }
  }

  const extraKeys = Array.from(extraKeysSet);
  const allHeaders = [...standardHeaders, ...extraKeys.map((k) => `attr_${k}`)];

  // Build CSV rows
  const rows: string[] = [];
  rows.push(allHeaders.map(formatCSVCell).join(","));

  for (const asset of assets) {
    const attrs = asset.attributes || {};
    const name = attrs.asset_name || attrs.office_name || asset.name || "";
    const dept = attrs.department_name || attrs.department_display || attrs.departme_1 || "";
    const assetType = attrs.asset_type_name || attrs.asset_ty_1 || "";
    const district = attrs.district_lgd_name || attrs.district_1 || "";
    const block = attrs.block_lgd_name || attrs.block_lgd1 || "";
    const panchayat = attrs.panchayat_lgd_name || attrs.panchayat1 || "";
    const village = attrs.village_lgd_name || attrs.village__1 || "";
    const address = attrs.asset_address || attrs.asset_addr || "";
    const pincode = attrs.pincode || "";
    const phone = attrs.mobile_number || attrs.mobile_num || "";
    const email = attrs.official_email || attrs.official_e || "";
    const ownership = attrs.ownership_type || attrs.ownership_ || "";
    const status = attrs.asset_status || "";
    const area = attrs.asset_area || "";
    const layerName = (asset as any).layer_name || asset.layer_id || "";

    const standardValues = [
      asset.id,
      name,
      dept,
      assetType,
      district,
      block,
      panchayat,
      village,
      address,
      pincode,
      asset.latitude ?? "",
      asset.longitude ?? "",
      phone,
      email,
      ownership,
      status,
      area,
      layerName,
    ];

    const extraValues = extraKeys.map((k) => attrs[k] ?? "");
    const rowValues = [...standardValues, ...extraValues];
    rows.push(rowValues.map(formatCSVCell).join(","));
  }

  const csvContent = "\uFEFF" + rows.join("\r\n"); // UTF-8 BOM for Excel compatibility
  const fname = filename || generateExportFilename(undefined, undefined, undefined, undefined, "csv");
  downloadBlob(csvContent, fname, "text/csv;charset=utf-8;");
}

/**
 * Export assets list to GeoJSON FeatureCollection format.
 */
export function exportAssetsToGeoJSON(assets: FilteredAsset[], filename?: string) {
  if (assets.length === 0) return;

  const features = assets.map((asset) => {
    const hasCoordinates = asset.longitude !== null && asset.latitude !== null;
    return {
      type: "Feature" as const,
      geometry: hasCoordinates
        ? {
            type: "Point" as const,
            coordinates: [asset.longitude!, asset.latitude!],
          }
        : null,
      properties: {
        id: asset.id,
        name: asset.name,
        layer_id: asset.layer_id,
        layer_name: (asset as any).layer_name || undefined,
        latitude: asset.latitude,
        longitude: asset.longitude,
        ...(asset.attributes || {}),
      },
    };
  });

  const geojson = {
    type: "FeatureCollection",
    totalFeatures: assets.length,
    features,
  };

  const fname = filename || generateExportFilename(undefined, undefined, undefined, undefined, "geojson");
  downloadBlob(JSON.stringify(geojson, null, 2), fname, "application/geo+json;charset=utf-8;");
}

/**
 * Export assets list to structured JSON format.
 */
export function exportAssetsToJSON(assets: FilteredAsset[], filename?: string) {
  if (assets.length === 0) return;

  const fname = filename || generateExportFilename(undefined, undefined, undefined, undefined, "json");
  downloadBlob(JSON.stringify(assets, null, 2), fname, "application/json;charset=utf-8;");
}
