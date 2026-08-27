import { api } from "./client";

export interface LayerSummary {
  layer_id: number;
  name: string;
  geometry_type: string;
  feature_count: number;
  crs: string;
  attributes: string[];
}

export interface DatasetSummary {
  dataset_id: number;
  name: string;
  file_type: string;
  geometry_type: string | null;
  feature_count: number;
  crs: string | null;
  layers: number;
}

export interface ProjectSummary {
  project_id: number;
  name: string;
  datasets: number;
  layers: number;
  assets: number;
}

export interface LayerHealth {
  layer_id: number;
  health_score: number;
  issues: string[];
  details: Record<string, unknown>;
}

export interface DataQuality {
  layer_id: number;
  quality_score: number;
  issues: string[];
  details: Record<string, unknown>;
}

export interface DuplicateResult {
  layer_id: number;
  duplicate_count: number;
  duplicates: unknown[];
}

export interface MissingGeometryResult {
  layer_id: number;
  missing_count: number;
  asset_ids: number[];
}

export interface InvalidCoordinateResult {
  layer_id: number;
  invalid_count: number;
  asset_ids: number[];
}

export interface CrsCheckResult {
  layer_id: number;
  crs: string;
  is_geographic: boolean;
  is_projected: boolean;
  issues: string[];
}

export interface AttributeCompletenessResult {
  layer_id: number;
  completeness: Record<string, number>;
}

export function getLayerSummary(layerId: number) {
  return api<LayerSummary>(`/ai/layer-summary/${layerId}`);
}
export function getDatasetSummary(datasetId: number) {
  return api<DatasetSummary>(`/ai/dataset-summary/${datasetId}`);
}
export function getProjectSummary(projectId: number) {
  return api<ProjectSummary>(`/ai/project-summary/${projectId}`);
}
export function getLayerHealth(layerId: number) {
  return api<LayerHealth>(`/ai/layer-health/${layerId}`);
}
export function getDataQuality(layerId: number) {
  return api<DataQuality>(`/ai/data-quality/${layerId}`);
}
export function getDuplicateAssets(layerId: number) {
  return api<DuplicateResult>(`/ai/duplicate-assets/${layerId}`);
}
export function getMissingGeometry(layerId: number) {
  return api<MissingGeometryResult>(`/ai/missing-geometry/${layerId}`);
}
export function getInvalidCoordinates(layerId: number) {
  return api<InvalidCoordinateResult>(`/ai/invalid-coordinates/${layerId}`);
}
export function getCrsCheck(layerId: number) {
  return api<CrsCheckResult>(`/ai/crs-check/${layerId}`);
}
export function getAttributeCompleteness(layerId: number) {
  return api<AttributeCompletenessResult>(`/ai/attribute-completeness/${layerId}`);
}
