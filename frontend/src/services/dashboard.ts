import { api } from "@/api/client";

import type {
  DashboardSummary,
  DashboardProject,
  DashboardDataset,
  DashboardLayer,
  DashboardAsset,
  StorageSummary,
  GeometrySummary,
  DashboardStatistics,
  DashboardData,
  AssetDistributionItem,
} from "@/types/dashboard";


// ============================================================
// SUMMARY
// ============================================================

export function getDashboardSummary() {
  return api<DashboardSummary>(
    "/dashboard/summary"
  );
}


// ============================================================
// RECENT PROJECTS
// ============================================================

export function getRecentProjects() {
  return api<DashboardProject[]>(
    "/dashboard/recent-projects"
  );
}


// ============================================================
// RECENT DATASETS
// ============================================================

export function getRecentDatasets() {
  return api<DashboardDataset[]>(
    "/dashboard/recent-datasets"
  );
}


// ============================================================
// RECENT LAYERS
// ============================================================

export function getRecentLayers() {
  return api<DashboardLayer[]>(
    "/dashboard/recent-layers"
  );
}


// ============================================================
// RECENT ASSETS
// ============================================================

export function getRecentAssets() {
  return api<DashboardAsset[]>(
    "/dashboard/recent-assets"
  );
}


// ============================================================
// STORAGE
// ============================================================

export function getStorageSummary() {
  return api<StorageSummary>(
    "/dashboard/storage"
  );
}


// ============================================================
// GEOMETRY
// ============================================================

export function getGeometrySummary() {
  return api<GeometrySummary>(
    "/dashboard/geometry-summary"
  );
}


// ============================================================
// STATISTICS
// ============================================================

export function getDashboardStatistics() {
  return api<DashboardStatistics>(
    "/dashboard/statistics"
  );
}


// ============================================================
// ASSET DISTRIBUTION
// ============================================================

export function getAssetDistribution(params?: { by?: "project" | "layer"; project_id?: number }) {
  const query = new URLSearchParams();
  if (params?.by) query.append("by", params.by);
  if (params?.project_id) query.append("project_id", String(params.project_id));
  const queryString = query.toString() ? `?${query.toString()}` : "";
  return api<AssetDistributionItem[]>(
    `/dashboard/asset-distribution${queryString}`
  );
}


// ============================================================
// COMPLETE DASHBOARD DATA
// ============================================================

export async function getDashboardData(): Promise<DashboardData> {

  const [
    summary,
    projects,
    datasets,
    layers,
    assets,
    storage,
    geometry,
    assetDistribution,
  ] = await Promise.all([

    getDashboardSummary(),

    getRecentProjects(),

    getRecentDatasets(),

    getRecentLayers(),

    getRecentAssets(),

    getStorageSummary(),

    getGeometrySummary(),

    getAssetDistribution(),

  ]);


  return {
    summary,

    projects,

    datasets,

    layers,

    assets,

    storage,

    geometry,

    assetDistribution,
  };
}