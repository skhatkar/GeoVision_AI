import { api } from "./client";

export interface BackendLayer {
  id: number;
  name: string;
  geometry_type: string;
  crs: string;
  feature_count: number;
  file_path: string;
  dataset_id: number;
  department_id: number;
  created_at: string;
  updated_at: string;
}

export async function getLayers() {
  return api<BackendLayer[]>("/layers");
}