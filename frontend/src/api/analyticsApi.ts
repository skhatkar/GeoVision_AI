import { api } from "./client";

export interface NameValueItem {
  name: string;
  value: number;
}

export interface UploadTrendItem {
  date: string;
  count: number;
}

export interface StorageUsageItem {
  name: string;
  size_mb: number;
}

export interface ProjectProgressItem {
  name: string;
  datasets: number;
  layers: number;
  assets: number;
}

export function getAssetsByLayer() {
  return api<NameValueItem[]>("/analytics/assets-by-layer");
}
export function getAssetsByDepartment() {
  return api<NameValueItem[]>("/analytics/assets-by-department");
}
export function getAssetsByGeometry() {
  return api<NameValueItem[]>("/analytics/assets-by-geometry");
}
export function getProjectProgress() {
  return api<ProjectProgressItem[]>("/analytics/project-progress");
}
export function getUploadTrends() {
  return api<UploadTrendItem[]>("/analytics/upload-trends");
}
export function getStorageUsage() {
  return api<StorageUsageItem[]>("/analytics/storage-usage");
}
export function getTopLayers() {
  return api<NameValueItem[]>("/analytics/top-layers");
}
export function getTopProjects() {
  return api<NameValueItem[]>("/analytics/top-projects");
}
