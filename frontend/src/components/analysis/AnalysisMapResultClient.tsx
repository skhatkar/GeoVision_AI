"use client";

import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import type { FeatureCollection, Feature, Geometry } from "geojson";

// Helper to safely parse stringified GeoJSON or WKT
function parseGeometry(rawGeom: any): Geometry | null {
  if (!rawGeom) return null;

  // Already a parsed GeoJSON Geometry object
  if (typeof rawGeom === "object" && rawGeom.type && rawGeom.coordinates) {
    return rawGeom as Geometry;
  }

  // Stringified GeoJSON or WKT string
  if (typeof rawGeom === "string") {
    const trimmed = rawGeom.trim();

    // JSON string
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && parsed.type && parsed.coordinates) {
          return parsed as Geometry;
        }
      } catch {}
    }

    // WKT POINT (lon lat)
    if (trimmed.toUpperCase().startsWith("POINT")) {
      const match = trimmed.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
      if (match) {
        return {
          type: "Point",
          coordinates: [parseFloat(match[1]), parseFloat(match[2])],
        };
      }
    }
  }

  return null;
}

// Helper component to fix Leaflet 0-size rendering & auto-fit bounds
function AutoFitBounds({ data }: { data: FeatureCollection }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
      if (data && data.features && data.features.length > 0) {
        try {
          const geoJsonLayer = L.geoJSON(data as any);
          const bounds = geoJsonLayer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [35, 35], maxZoom: 16 });
          }
        } catch (e) {
          console.warn("Could not fit bounds to analysis result:", e);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [map, data]);

  return null;
}

interface Props {
  result: any;
  toolId?: string;
}

export default function AnalysisMapResultClient({ result, toolId }: Props) {
  // Convert any result shape into a standard GeoJSON FeatureCollection
  const geoJsonData = useMemo<FeatureCollection | null>(() => {
    if (!result) return null;

    // Case 1: Result is already a GeoJSON FeatureCollection
    if (result.type === "FeatureCollection" && Array.isArray(result.features)) {
      const features: Feature[] = [];
      result.features.forEach((f: any) => {
        const geom = parseGeometry(f.geometry);
        if (geom) {
          features.push({
            type: "Feature",
            geometry: geom,
            properties: f.properties || { ...f, geometry: undefined },
          });
        }
      });
      if (features.length > 0) {
        return { type: "FeatureCollection", features };
      }
    }

    // Case 2: Result is a single GeoJSON Feature
    if (result.type === "Feature") {
      const geom = parseGeometry(result.geometry);
      if (geom) {
        return {
          type: "FeatureCollection",
          features: [{ type: "Feature", geometry: geom, properties: result.properties || {} }],
        };
      }
    }

    // Case 3: Result object has a geometry, centroid, or bbox property directly
    const directGeom = parseGeometry(result.geometry || result.centroid || result.bbox || result.buffer_geometry);
    if (directGeom) {
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: directGeom,
            properties: { ...result, geometry: undefined, centroid: undefined, bbox: undefined },
          },
        ],
      };
    }

    // Case 4: Result contains features array, results array, assets array, or centroids array
    const rawFeatures =
      result.features ||
      result.results ||
      result.assets ||
      result.centroids ||
      result.data ||
      (Array.isArray(result) ? result : null);

    if (Array.isArray(rawFeatures) && rawFeatures.length > 0) {
      const features: Feature[] = [];

      rawFeatures.forEach((item, idx) => {
        if (!item) return;

        // Try extracting geometry from item or item.centroid
        const itemGeom = parseGeometry(item.geometry || item.centroid || item.shape);

        if (itemGeom) {
          features.push({
            type: "Feature",
            geometry: itemGeom,
            properties: item.properties || item.attributes || { ...item, geometry: undefined, centroid: undefined },
          });
        } else if (item.lat !== undefined && item.lng !== undefined) {
          features.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [Number(item.lng), Number(item.lat)],
            },
            properties: { id: item.id || idx + 1, name: item.name || `Asset #${idx + 1}`, ...item },
          });
        } else if (item.latitude !== undefined && item.longitude !== undefined) {
          features.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [Number(item.longitude), Number(item.latitude)],
            },
            properties: { id: item.id || idx + 1, name: item.name || `Asset #${idx + 1}`, ...item },
          });
        }
      });

      if (features.length > 0) {
        return {
          type: "FeatureCollection",
          features,
        };
      }
    }

    // Case 5: Single item with lat / lng
    if (result.lat !== undefined && result.lng !== undefined) {
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [Number(result.lng), Number(result.lat)],
            },
            properties: result,
          },
        ],
      };
    }

    return null;
  }, [result]);

  const defaultStyle = {
    color: "#06b6d4", // Cyan 500
    weight: 3,
    opacity: 0.95,
    fillColor: "#10b981", // Emerald 500
    fillOpacity: 0.35,
  };

  const pointToLayer = (_feature: Feature, latlng: L.LatLng) => {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: "#06b6d4",
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
    });
  };

  const onEachFeature = (feature: Feature, layer: L.Layer) => {
    if (feature.properties) {
      const props = feature.properties;
      const title = props.name || props.asset_name || props.title || props.id || `Feature #${props.id || 1}`;
      const entries = Object.entries(props)
        .slice(0, 7)
        .filter(([k]) => k !== "geometry" && k !== "buffer_geometry" && k !== "centroid")
        .map(
          ([k, v]) =>
            `<div style="display:flex;justify-content:space-between;gap:12px;font-size:11px;margin-top:3px;">
              <span style="color:#64748b;font-weight:600;text-transform:capitalize;">${k.replace(/_/g, " ")}:</span>
              <span style="font-family:monospace;font-weight:600;color:#0f172a;">${typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
            </div>`
        )
        .join("");

      layer.bindPopup(`
        <div style="font-family:sans-serif;padding:2px;min-width:180px;max-width:240px;">
          <h4 style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#0284c7;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">
            ${title}
          </h4>
          ${entries}
        </div>
      `);
    }
  };

  // If the query output is purely scalar metrics (like area or total length) without feature geometries
  if (!geoJsonData || geoJsonData.features.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-sky-500/30 bg-sky-500/5 text-center space-y-2">
        <div className="h-10 w-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-lg">
          📏
        </div>
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">
          Scalar Spatial Calculation Complete
        </p>
        <p className="text-xs text-muted-foreground max-w-md">
          This analysis calculated numeric GIS totals for the layer (such as total area or length).
          To view numeric statistics, check the <strong className="text-primary font-semibold">Summary</strong> tab.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-border/70 shadow-inner bg-slate-950">
      <MapContainer
        center={[31.1048, 77.1734]}
        zoom={8}
        zoomControl={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          key={JSON.stringify(geoJsonData).slice(0, 120) + geoJsonData.features.length}
          data={geoJsonData}
          style={defaultStyle}
          pointToLayer={pointToLayer}
          onEachFeature={onEachFeature}
        />
        <AutoFitBounds data={geoJsonData} />
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Map Overlay Badge */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 rounded-lg bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-[11px] font-medium text-slate-100 border border-slate-700/70 shadow-lg">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{geoJsonData.features.length} GeoJSON Feature{geoJsonData.features.length > 1 ? "s" : ""} Rendered</span>
      </div>
    </div>
  );
}
