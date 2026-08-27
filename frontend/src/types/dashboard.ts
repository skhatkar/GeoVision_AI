// ============================================================
// DASHBOARD SUMMARY
// ============================================================

export interface DashboardSummary {
  total_projects: number;
  total_datasets: number;
  total_layers: number;
  total_assets: number;
  total_departments: number;
}


// ============================================================
// PROJECT
// ============================================================

export interface DashboardProject {
  id: number;
  name: string;
  created_at: string | null;
}


// ============================================================
// DATASET
// ============================================================

export interface DashboardDataset {
  id: number;
  name: string;
  file_name: string;
  file_type: string;
  feature_count: number;
  project_id: number;
  created_at: string | null;
}


// ============================================================
// LAYER
// ============================================================

export interface DashboardLayer {
  id: number;
  name: string;
  geometry_type: string;
  feature_count: number;
  dataset_id: number;
  department_id: number;
  created_at: string | null;
}


// ============================================================
// ASSET
// ============================================================

export interface DashboardAsset {
  id: number;
  name: string | null;
  layer_id: number;
  created_at: string | null;
}


// ============================================================
// STORAGE
// ============================================================

export interface StorageSummary {
  total_size_mb: number;
  total_files: number;
}


// ============================================================
// GEOMETRY
// ============================================================

export interface GeometrySummary {
  point_layers: number;
  line_layers: number;
  polygon_layers: number;
}


// ============================================================
// STATISTICS
// ============================================================

export interface DashboardStatistics {
  projects: number;
  datasets: number;
  layers: number;
  assets: number;
}


// ============================================================
// ASSET DISTRIBUTION
// ============================================================

export interface AssetDistributionItem {
  id?: number;
  name: string;
  value: number;
}


// ============================================================
// COMPLETE DASHBOARD DATA
// ============================================================

export interface DashboardData {
  summary: DashboardSummary;

  projects: DashboardProject[];

  datasets: DashboardDataset[];

  layers: DashboardLayer[];

  assets: DashboardAsset[];

  storage: StorageSummary;

  geometry: GeometrySummary;

  assetDistribution: AssetDistributionItem[];
}