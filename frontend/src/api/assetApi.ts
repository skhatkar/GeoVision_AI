import { api } from "./client";

export interface BackendAsset {
  id: number;
  name: string;
  geometry: string;
  attributes: Record<string, any>;
  layer_id: number;
  created_at: string;
  updated_at: string;
}

export async function getAssets(layerId: number) {
  return api<BackendAsset[]>(`/assets/layer/${layerId}`);
}