import * as turf from "@turf/turf";
import type { GISLayer } from "@/types/layer";
import { getBoundaryAssets, type BoundaryLayerGroup, type BoundaryAssetItem } from "@/api/analysisApi";

export interface LayerAssetBreakdown {
  layerId: string | number;
  layerName: string;
  geometryType: string;
  icon?: string;
  customIcon?: string;
  color: string;
  projectId?: number | string;
  projectName?: string;
  count: number;
  assets: BoundaryAssetItem[];
}

export interface BoundaryAnalysisResult {
  totalCount: number;
  totalLayers: number;
  boundaryName?: string;
  layers: LayerAssetBreakdown[];
}

/**
 * Checks if a feature is a Polygon or MultiPolygon
 */
export function isPolygonFeature(feature: any): boolean {
  if (!feature || !feature.geometry) return false;
  const type = (feature.geometry.type || "").toLowerCase();
  return type === "polygon" || type === "multipolygon";
}

/**
 * Runs client-side Turf.js containment analysis for all active GIS layers
 */
export function analyzeBoundaryClientSide(
  boundaryFeature: any,
  activeLayers: GISLayer[],
  loadedGeoJsonMap: Map<string, any>,
  containerLayerId?: string | null,
  containerLayerName?: string | null
): BoundaryAnalysisResult {
  if (!isPolygonFeature(boundaryFeature)) {
    return { totalCount: 0, totalLayers: 0, layers: [] };
  }

  const boundaryPoly = boundaryFeature;
  const layerResults: LayerAssetBreakdown[] = [];
  let totalCount = 0;

  for (const layer of activeLayers) {
    // 1. Skip the container layer itself (e.g. clicking on Shimla district should not list other districts from District Boundary)
    if (
      (containerLayerId && String(layer.id) === String(containerLayerId)) ||
      (containerLayerName && layer.name.toLowerCase() === containerLayerName.toLowerCase())
    ) {
      continue;
    }

    const geojsonData = loadedGeoJsonMap.get(layer.id);
    if (!geojsonData || !geojsonData.features) continue;

    const matchedAssets: BoundaryAssetItem[] = [];

    for (const feat of geojsonData.features) {
      // Don't compare the boundary polygon with itself
      if (
        feat === boundaryFeature ||
        (feat.properties?.id && boundaryFeature.properties?.id && feat.properties.id === boundaryFeature.properties.id)
      ) {
        continue;
      }

      const geomType = (feat.geometry?.type || "").toLowerCase();
      let isInside = false;

      try {
        if (geomType === "point") {
          // Point inside or touching boundary
          isInside = turf.booleanPointInPolygon(feat.geometry, boundaryPoly);
        } else if (geomType === "multipoint") {
          const coords = feat.geometry.coordinates || [];
          isInside = coords.some((pt: [number, number]) =>
            turf.booleanPointInPolygon(turf.point(pt), boundaryPoly)
          );
        } else if (geomType === "linestring" || geomType === "multilinestring") {
          // Line must intersect interior
          isInside = turf.booleanIntersects(feat.geometry, boundaryPoly);
        } else if (geomType === "polygon" || geomType === "multipolygon") {
          // Polygon Assets (e.g. Forests, Parks, Lakes):
          // Check interior containment or centroid inside.
          const centroid = turf.centroid(feat);
          const centroidInside = turf.booleanPointInPolygon(centroid, boundaryPoly);
          const fullContainment = turf.booleanContains(boundaryPoly, feat);
          isInside = centroidInside || fullContainment;
        }
      } catch (err) {
        isInside = false;
      }

      if (isInside) {
        let lat: number | undefined;
        let lng: number | undefined;
        try {
          const center = turf.center(feat);
          lng = center.geometry.coordinates[0];
          lat = center.geometry.coordinates[1];
        } catch {
          // ignore
        }

        matchedAssets.push({
          id: feat.properties?.id ?? feat.properties?.OBJECTID ?? feat.id ?? Math.random().toString(),
          name: feat.properties?.name ?? feat.properties?.NAME ?? feat.properties?.title ?? `Asset #${matchedAssets.length + 1}`,
          attributes: feat.properties ?? {},
          latitude: lat,
          longitude: lng,
          geometry: feat.geometry,
        });
      }
    }

    if (matchedAssets.length > 0) {
      totalCount += matchedAssets.length;
      layerResults.push({
        layerId: layer.id,
        layerName: layer.name,
        geometryType: layer.geometryType || "Unknown",
        icon: layer.icon,
        customIcon: layer.customIcon,
        color: layer.color || "#2563EB",
        projectId: layer.projectId,
        projectName: layer.projectName,
        count: matchedAssets.length,
        assets: matchedAssets,
      });
    }
  }

  const boundaryName =
    boundaryFeature.properties?.name ||
    boundaryFeature.properties?.NAME ||
    boundaryFeature.properties?.district ||
    boundaryFeature.properties?.DISTRICT ||
    boundaryFeature.properties?.title ||
    "Selected Boundary";

  return {
    totalCount,
    totalLayers: layerResults.length,
    boundaryName,
    layers: layerResults,
  };
}

/**
 * Hybrid query: combines Turf.js client-side results with PostGIS backend API results
 */
export async function queryBoundaryAssets(
  boundaryFeature: any,
  activeLayers: GISLayer[],
  loadedGeoJsonMap: Map<string, any>,
  containerLayerId?: string | null,
  containerLayerName?: string | null
): Promise<BoundaryAnalysisResult> {
  // 1. Instant client-side analysis
  const clientResult = analyzeBoundaryClientSide(
    boundaryFeature,
    activeLayers,
    loadedGeoJsonMap,
    containerLayerId,
    containerLayerName
  );

  // 2. Server-side PostGIS query for full database coverage
  try {
    const assetId = boundaryFeature?.properties?.id
      ? Number(boundaryFeature.properties.id)
      : undefined;

    const layerIdNum = containerLayerId && Number.isFinite(Number(containerLayerId))
      ? Number(containerLayerId)
      : undefined;

    const serverRes = await getBoundaryAssets({
      geometry: boundaryFeature.geometry,
      asset_id: Number.isFinite(assetId) ? assetId : undefined,
      layer_id: layerIdNum,
    });

    if (serverRes && serverRes.layers && serverRes.layers.length > 0) {
      // Map server layers with store layer styling (color, custom icons, project)
      const layerMap = new Map(activeLayers.map((l) => [String(l.id), l]));

      const enrichedLayers: LayerAssetBreakdown[] = serverRes.layers.map((grp) => {
        const storeL = layerMap.get(String(grp.layer_id)) || activeLayers.find((l) => l.name === grp.layer_name);
        return {
          layerId: grp.layer_id,
          layerName: grp.layer_name,
          geometryType: grp.geometry_type,
          icon: storeL?.icon,
          customIcon: storeL?.customIcon,
          color: storeL?.color || "#2563EB",
          projectId: storeL?.projectId,
          projectName: storeL?.projectName,
          count: grp.count,
          assets: grp.assets,
        };
      });

      return {
        totalCount: serverRes.total_count,
        totalLayers: serverRes.total_layers,
        boundaryName: clientResult.boundaryName,
        layers: enrichedLayers,
      };
    }
  } catch (err) {
    console.warn("Server-side spatial query failed, using client-side Turf results:", err);
  }

  return clientResult;
}

export interface DrawnShapeAnalysisResult {
  shapeType: "Polygon" | "Rectangle" | "Circle" | "Line" | "Marker" | "Other";
  areaSqMeters?: number;
  areaHectares?: number;
  areaSqKm?: number;
  areaAcres?: number;
  lengthKm?: number;
  perimeterKm?: number;
  radiusMeters?: number;
  center?: [number, number]; // [lat, lng]
  containedBreakdown: BoundaryAnalysisResult;
  geoJson: any;
}

/**
 * Calculates comprehensive Area, Perimeter, Length, Center, and contained GIS assets for any drawn shape.
 */
export function calculateDrawnShapeAnalysis(
  layer: any,
  activeLayers: GISLayer[],
  loadedGeoJsonMap: Map<string, any>
): DrawnShapeAnalysisResult {
  const pmShape = layer?.pm?.getShape?.() || layer?.pm?.shape || "";
  let shapeType: DrawnShapeAnalysisResult["shapeType"] = "Other";
  let geoJson: any = null;
  let radiusMeters: number | undefined;

  try {
    if (layer.toGeoJSON) {
      geoJson = layer.toGeoJSON();
    }
  } catch (err) {
    // fallback
  }

  // Handle Circle specially
  if (typeof layer.getRadius === "function" && typeof layer.getLatLng === "function") {
    shapeType = "Circle";
    const centerLatLng = layer.getLatLng();
    radiusMeters = layer.getRadius();
    if (radiusMeters !== undefined && centerLatLng) {
      // Convert circle to turf polygon with 64 steps
      geoJson = turf.circle([centerLatLng.lng, centerLatLng.lat], radiusMeters, {
        steps: 64,
        units: "meters",
      });
    }
  } else if (pmShape === "Rectangle" || (geoJson?.geometry?.type === "Polygon" && geoJson?.properties?.shape === "Rectangle")) {
    shapeType = "Rectangle";
  } else if (geoJson?.geometry?.type === "Polygon" || geoJson?.geometry?.type === "MultiPolygon") {
    shapeType = "Polygon";
  } else if (geoJson?.geometry?.type === "LineString" || geoJson?.geometry?.type === "MultiLineString") {
    shapeType = "Line";
  } else if (geoJson?.geometry?.type === "Point") {
    shapeType = "Marker";
  }

  let areaSqMeters: number | undefined;
  let areaHectares: number | undefined;
  let areaSqKm: number | undefined;
  let areaAcres: number | undefined;
  let lengthKm: number | undefined;
  let perimeterKm: number | undefined;
  let center: [number, number] | undefined;

  if (geoJson) {
    try {
      const centerPt = turf.center(geoJson);
      if (centerPt?.geometry?.coordinates) {
        center = [centerPt.geometry.coordinates[1], centerPt.geometry.coordinates[0]];
      }
    } catch {
      // ignore
    }

    if (shapeType === "Polygon" || shapeType === "Rectangle" || shapeType === "Circle") {
      try {
        const sqM = turf.area(geoJson);
        areaSqMeters = Number(sqM.toFixed(1));
        areaHectares = Number((sqM / 10000).toFixed(2));
        areaSqKm = Number((sqM / 1000000).toFixed(4));
        areaAcres = Number((sqM * 0.000247105).toFixed(2));

        const polyLine = turf.polygonToLine(geoJson);
        const pLen = turf.length(polyLine as any, { units: "kilometers" });
        perimeterKm = Number(pLen.toFixed(3));
      } catch (err) {
        console.warn("Polygon area calculation warning:", err);
      }
    } else if (shapeType === "Line") {
      try {
        const len = turf.length(geoJson, { units: "kilometers" });
        lengthKm = Number(len.toFixed(3));
      } catch (err) {
        console.warn("Line length calculation warning:", err);
      }
    }
  }

  // Calculate contained assets inside the polygon / corridor
  let containedBreakdown: BoundaryAnalysisResult = { totalCount: 0, totalLayers: 0, layers: [] };
  if (geoJson && (shapeType === "Polygon" || shapeType === "Rectangle" || shapeType === "Circle")) {
    containedBreakdown = analyzeBoundaryClientSide(geoJson, activeLayers, loadedGeoJsonMap);
  } else if (geoJson && shapeType === "Line") {
    // For lines: buffer by 100m corridor to detect nearby facilities along the route!
    try {
      const lineBuffer = turf.buffer(geoJson, 0.1, { units: "kilometers" });
      if (lineBuffer) {
        containedBreakdown = analyzeBoundaryClientSide(lineBuffer, activeLayers, loadedGeoJsonMap);
      }
    } catch (err) {
      console.warn("Line corridor analysis warning:", err);
    }
  }

  return {
    shapeType,
    areaSqMeters,
    areaHectares,
    areaSqKm,
    areaAcres,
    lengthKm,
    perimeterKm,
    radiusMeters,
    center,
    containedBreakdown,
    geoJson,
  };
}

