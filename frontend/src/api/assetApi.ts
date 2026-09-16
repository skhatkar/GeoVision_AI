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

export interface HierarchyPanchayat {
  name: string;
  total_assets: number;
  departments: { name: string; count: number }[];
}

export interface HierarchyBlock {
  name: string;
  total_assets: number;
  panchayats: HierarchyPanchayat[];
}

export interface HierarchyDistrict {
  name: string;
  total_assets: number;
  blocks: HierarchyBlock[];
}

export interface HierarchyResponse {
  total_districts: number;
  districts: HierarchyDistrict[];
}

export interface FilteredAsset {
  id: number;
  name: string | null;
  attributes: Record<string, any>;
  layer_id: number;
  created_at: string | null;
  updated_at: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function getAssets(layerId: number) {
  return api<BackendAsset[]>(`/assets/layer/${layerId}`);
}

export async function getAllAssets() {
  return api<BackendAsset[]>("/assets");
}

export async function getAdministrativeHierarchy() {
  return api<HierarchyResponse>("/assets/hierarchy");
}

export async function getFilteredAssets(params: {
  district?: string;
  block?: string;
  panchayat?: string;
  department?: string;
}) {
  const query = new URLSearchParams();
  if (params.district) query.set("district", params.district);
  if (params.block) query.set("block", params.block);
  if (params.panchayat) query.set("panchayat", params.panchayat);
  if (params.department) query.set("department", params.department);
  const qStr = query.toString();
  return api<FilteredAsset[]>(`/assets/filter${qStr ? `?${qStr}` : ""}`);
}
