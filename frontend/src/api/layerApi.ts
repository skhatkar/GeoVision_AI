import { API_BASE_URL, api } from "./client";

export interface BackendLayer {
  id: number;
  name: string;
  geometry_type: string;
  crs: string;
  feature_count: number;
  file_path: string;
  dataset_id: number;
  department_id: number;
  project_id?: number;
  project_name?: string;
  created_at: string;
  updated_at: string;
}

export function getLayers(signal?: AbortSignal) {
  return api<BackendLayer[]>("/layers", { signal });
}

export function getLayerGeoJsonUrl(layerId: number): string {
  return `${API_BASE_URL}/geojson/layer/${layerId}`;
}
