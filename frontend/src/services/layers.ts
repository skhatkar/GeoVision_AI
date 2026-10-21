import { apiFetch } from "./api";

export interface BackendLayer {
  id: number;
  name: string;
  geometry_type: string;
  crs: string;
  feature_count: number;
  file_path: string;
  dataset_id: number;
  department_id: number;
}

export async function getLayers(): Promise<BackendLayer[]> {
  const res = await apiFetch<any>("/layers");
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  return [];
}