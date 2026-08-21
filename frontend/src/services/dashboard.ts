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

export function getAssetDistribution() {
  return api<AssetDistributionItem[]>(
    "/dashboard/asset-distribution"
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