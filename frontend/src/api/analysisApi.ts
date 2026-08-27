import { api } from "./client";

export interface AnalysisResult {
  type?: string;
  features?: unknown[];
  feature_count?: number;
  result?: unknown;
  [key: string]: unknown;
}

// Spatial Relations
export function runBuffer(assetId: number, distance: number) {
  return api<AnalysisResult>(`/analysis/buffer?asset_id=${assetId}&distance=${distance}`, { method: "POST" });
}
export function runIntersect(layer1Id: number, layer2Id: number) {
  return api<AnalysisResult>(`/analysis/intersect?layer1_id=${layer1Id}&layer2_id=${layer2Id}`, { method: "POST" });
}
export function runWithin(containerLayerId: number, targetLayerId: number) {
  return api<AnalysisResult>(`/analysis/within?container_layer_id=${containerLayerId}&target_layer_id=${targetLayerId}`, { method: "POST" });
}
export function runContains(containerLayerId: number, targetLayerId: number) {
  return api<AnalysisResult>(`/analysis/contains?container_layer_id=${containerLayerId}&target_layer_id=${targetLayerId}`, { method: "POST" });
}
export function runTouches(layer1Id: number, layer2Id: number) {
  return api<AnalysisResult>(`/analysis/touches?layer1_id=${layer1Id}&layer2_id=${layer2Id}`, { method: "POST" });
}
export function runCrosses(layer1Id: number, layer2Id: number) {
  return api<AnalysisResult>(`/analysis/crosses?layer1_id=${layer1Id}&layer2_id=${layer2Id}`, { method: "POST" });
}
export function runOverlaps(layer1Id: number, layer2Id: number) {
  return api<AnalysisResult>(`/analysis/overlaps?layer1_id=${layer1Id}&layer2_id=${layer2Id}`, { method: "POST" });
}
export function runNearest(lat: number, lng: number, limit = 10) {
  return api<AnalysisResult>(`/analysis/nearest?latitude=${lat}&longitude=${lng}&limit=${limit}`);
}

// Geometry
export function runCentroid(layerId: number) {
  return api<AnalysisResult>(`/analysis/centroid/${layerId}`);
}
export function runConvexHull(layerId: number) {
  return api<AnalysisResult>(`/analysis/convex-hull/${layerId}`);
}
export function runBbox(layerId: number) {
  return api<AnalysisResult>(`/analysis/bbox/${layerId}`);
}
export function runArea(layerId: number) {
  return api<AnalysisResult>(`/analysis/area/${layerId}`);
}
export function runLength(layerId: number) {
  return api<AnalysisResult>(`/analysis/length/${layerId}`);
}

// Advanced GIS
export function runClip(inputLayerId: number, clipLayerId: number) {
  return api<AnalysisResult>(`/analysis/clip?input_layer_id=${inputLayerId}&clip_layer_id=${clipLayerId}`, { method: "POST" });
}
export function runUnion(layerId: number) {
  return api<AnalysisResult>(`/analysis/union/${layerId}`, { method: "POST" });
}
export function runDifference(layer1Id: number, layer2Id: number) {
  return api<AnalysisResult>(`/analysis/difference?layer1_id=${layer1Id}&layer2_id=${layer2Id}`, { method: "POST" });
}
export function runDissolve(layerId: number, field: string) {
  return api<AnalysisResult>(`/analysis/dissolve?layer_id=${layerId}&field=${field}`, { method: "POST" });
}
export function runSpatialJoin(targetLayerId: number, joinLayerId: number) {
  return api<AnalysisResult>(`/analysis/spatial-join?target_layer_id=${targetLayerId}&join_layer_id=${joinLayerId}`, { method: "POST" });
}
export function runMultiBuffer(layerId: number, distance: number) {
  return api<AnalysisResult>(`/analysis/multi-buffer?layer_id=${layerId}&distance=${distance}`, { method: "POST" });
}

// ML / Stats
export function runHeatmap(layerId: number) {
  return api<AnalysisResult>(`/analysis/heatmap/${layerId}`);
}
export function runDensity(layerId: number) {
  return api<AnalysisResult>(`/analysis/density/${layerId}`);
}
export function runKmeans(layerId: number, clusters = 5) {
  return api<AnalysisResult>(`/analysis/kmeans/${layerId}?clusters=${clusters}`);
}

// Boundary Assets Layer-Wise Breakdown
export interface BoundaryAssetItem {
  id: number | string;
  name: string;
  attributes: Record<string, any>;
  latitude?: number;
  longitude?: number;
  geometry?: any;
}

export interface BoundaryLayerGroup {
  layer_id: number | string;
  layer_name: string;
  geometry_type: string;
  count: number;
  assets: BoundaryAssetItem[];
}

export interface BoundaryAssetsResponse {
  total_count: number;
  total_layers: number;
  layers: BoundaryLayerGroup[];
}

export function getBoundaryAssets(payload: { geometry?: any; asset_id?: number; layer_id?: number }) {
  return api<BoundaryAssetsResponse>(`/analysis/boundary-assets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

