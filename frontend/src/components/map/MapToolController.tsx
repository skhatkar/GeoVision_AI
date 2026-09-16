"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useMap } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import {
  Ruler,
  Square,
  RotateCcw,
  Check,
  X,
  BookmarkPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { useToolStore } from "@/store/toolStore";
import { useSelectionStore } from "@/store/selectionStore";
import { useDrawingStore } from "@/store/drawingStore";
import { useLayerStore } from "@/store/layerStore";
import { calculateDrawnShapeAnalysis } from "@/lib/spatialAnalysis";

// ============================================================
// TYPES
// ============================================================

interface MeasurementState {
  layer: L.Polyline | L.Polygon | null;
  points: L.LatLng[];
  markers: L.CircleMarker[];
  guideLine: L.Polyline | null;
  isFinished: boolean;
}

type GeomanPM = {
  enableDraw: (
    shape: string,
    options?: Record<string, unknown>
  ) => void;
  disableDraw: () => void;
  globalDrawModeEnabled?: () => boolean;
  enableGlobalRemovalMode: () => void;
  disableGlobalRemovalMode: () => void;
  globalRemovalModeEnabled?: () => boolean;
  enableGlobalEditMode: () => void;
  disableGlobalEditMode: () => void;
  globalEditModeEnabled?: () => boolean;
  globalDragModeEnabled?: () => boolean;
};

type GeomanMap = L.Map & {
  pm?: GeomanPM;
};

// ============================================================
// COMPONENT
// ============================================================

export default function MapToolController() {
  const map = useMap();

  // Stores
  const activeTool = useToolStore((state) => state.activeTool);
  const clearTool = useToolStore((state) => state.clearTool);
  const setSelection = useSelectionStore((state) => state.setSelection);
  const addDrawing = useDrawingStore((state) => state.addDrawing);

  // Measurement State for HUD display
  const [measureStats, setMeasureStats] = useState<{
    distanceMeters: number;
    areaSqMeters: number;
    pointsCount: number;
    isFinished: boolean;
  }>({
    distanceMeters: 0,
    areaSqMeters: 0,
    pointsCount: 0,
    isFinished: false,
  });

  // Internal measurement refs
  const measurementRef = useRef<MeasurementState>({
    layer: null,
    points: [],
    markers: [],
    guideLine: null,
    isFinished: false,
  });

  const temporaryLayersRef = useRef<L.Layer[]>([]);

  // ==========================================================
  // GEOMAN
  // ==========================================================

  const getGeoman = useCallback(() => {
    const geomanMap = map as GeomanMap;
    return geomanMap.pm ?? null;
  }, [map]);

  // ==========================================================
  // CLEAR MEASUREMENT
  // ==========================================================

  const clearMeasurement = useCallback(() => {
    const measurement = measurementRef.current;

    // Remove layer
    if (measurement.layer && map.hasLayer(measurement.layer)) {
      map.removeLayer(measurement.layer);
    }

    // Remove guide line
    if (measurement.guideLine && map.hasLayer(measurement.guideLine)) {
      map.removeLayer(measurement.guideLine);
    }

    // Remove vertex markers
    measurement.markers.forEach((marker) => {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });

    measurementRef.current = {
      layer: null,
      points: [],
      markers: [],
      guideLine: null,
      isFinished: false,
    };

    setMeasureStats({
      distanceMeters: 0,
      areaSqMeters: 0,
      pointsCount: 0,
      isFinished: false,
    });
  }, [map]);

  // ==========================================================
  // CLEAR TEMPORARY LAYERS
  // ==========================================================

  const clearTemporaryLayers = useCallback(() => {
    temporaryLayersRef.current.forEach((layer) => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    temporaryLayersRef.current = [];
  }, [map]);

  // ==========================================================
  // DISABLE GEOMAN
  // ==========================================================

  const disableDrawing = useCallback(() => {
    const pm = getGeoman();
    if (!pm) return;
    try {
      if (pm.globalDrawModeEnabled?.()) {
        pm.disableDraw();
      }
      if (pm.globalRemovalModeEnabled?.()) {
        pm.disableGlobalRemovalMode();
      }
      if (pm.globalEditModeEnabled?.()) {
        pm.disableGlobalEditMode();
      }
    } catch {
      // ignore
    }
  }, [getGeoman]);

  // ==========================================================
  // ENABLE GEOMAN
  // ==========================================================

  const enableDrawing = useCallback(
    (tool: "draw-point" | "draw-line" | "draw-polygon") => {
      const pm = getGeoman();
      if (!pm) return;

      try {
        if (pm.globalDrawModeEnabled?.()) {
          pm.disableDraw();
        }
        if (pm.globalRemovalModeEnabled?.()) {
          pm.disableGlobalRemovalMode();
        }
        if (pm.globalEditModeEnabled?.()) {
          pm.disableGlobalEditMode();
        }
        switch (tool) {
          case "draw-point":
            pm.enableDraw("Marker", { continueDrawing: false });
            break;
          case "draw-line":
            pm.enableDraw("Line", { continueDrawing: false });
            break;
          case "draw-polygon":
            pm.enableDraw("Polygon", { continueDrawing: false });
            break;
        }
      } catch (error) {
        console.error("GeoVision: Geoman drawing error:", error);
      }
    },
    [getGeoman]
  );

  // ==========================================================
  // FINISH MEASUREMENT
  // ==========================================================

  const finishMeasurement = useCallback(() => {
    const measurement = measurementRef.current;
    if (measurement.isFinished) return;

    if (measurement.points.length < 2) {
      clearMeasurement();
      return;
    }

    measurement.isFinished = true;

    // Remove rubber-band guide line
    if (measurement.guideLine && map.hasLayer(measurement.guideLine)) {
      map.removeLayer(measurement.guideLine);
      measurement.guideLine = null;
    }

    // Style layer as finished solid
    if (measurement.layer) {
      measurement.layer.setStyle({
        dashArray: undefined,
        weight: 4,
      });

      // Bind summary popup
      if (activeTool === "measure-distance") {
        const totalDist = calculatePathDistance(measurement.points);
        measurement.layer.bindPopup(
          `<div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <b style="color: #2563eb;">📏 Distance Measurement</b><br/>
            Total Length: <b>${formatDistance(totalDist)}</b><br/>
            Points: ${measurement.points.length}
          </div>`
        ).openPopup();
      } else if (activeTool === "measure-area" && measurement.points.length >= 3) {
        const totalArea = calculatePolygonArea(measurement.points);
        const perimeter = calculatePathDistance([...measurement.points, measurement.points[0]]);
        measurement.layer.bindPopup(
          `<div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <b style="color: #059669;">📐 Area Measurement</b><br/>
            Area: <b>${formatArea(totalArea)}</b><br/>
            Perimeter: ${formatDistance(perimeter)}<br/>
            Points: ${measurement.points.length}
          </div>`
        ).openPopup();
      }
    }

    setMeasureStats((prev) => ({
      ...prev,
      isFinished: true,
    }));
  }, [map, activeTool, clearMeasurement]);

  // ==========================================================
  // SAVE MEASUREMENT AS DRAWING / AOI
  // ==========================================================

  const saveMeasurementAsDrawing = useCallback(() => {
    const measurement = measurementRef.current;
    if (!measurement.layer || measurement.points.length < 2) return;

    const layers = useLayerStore.getState().layers;
    const geoJsonMap = new Map<string, any>(
      Object.entries(useLayerStore.getState().geoJsonData)
    );

    const analysis = calculateDrawnShapeAnalysis(measurement.layer, layers, geoJsonMap);
    const id = "measure_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const label =
      activeTool === "measure-area"
        ? `Measured Area (${formatArea(analysis.areaSqMeters || 0)})`
        : `Measured Route (${formatDistance((analysis.lengthKm || 0) * 1000)})`;

    addDrawing({
      id,
      name: label,
      layer: measurement.layer,
      analysis,
      createdAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    });

    // Reset controller state without removing the saved layer
    measurementRef.current = {
      layer: null,
      points: [],
      markers: [],
      guideLine: null,
      isFinished: false,
    };

    clearTool();
  }, [activeTool, addDrawing, clearTool]);

  // ==========================================================
  // DISTANCE CLICK
  // ==========================================================

  const handleDistanceClick = useCallback(
    (event: L.LeafletMouseEvent) => {
      const point = event.latlng;
      const measurement = measurementRef.current;
      if (measurement.isFinished) return;

      measurement.points.push(point);
      const pointsCount = measurement.points.length;

      // Calculate total distance so far
      const totalDist = calculatePathDistance(measurement.points);

      // Create vertex marker (interactive: false so clicks pass through)
      const isStart = pointsCount === 1;
      const marker = L.circleMarker(point, {
        radius: isStart ? 6 : 5,
        color: "#2563EB",
        fillColor: isStart ? "#2563EB" : "#ffffff",
        fillOpacity: 1,
        weight: 2,
        interactive: false,
      }).addTo(map);

      // Tooltip on point
      const label = isStart
        ? "Start"
        : `${formatDistance(totalDist)}`;

      marker.bindTooltip(label, {
        permanent: true,
        direction: "top",
        className: "measure-tooltip",
        offset: [0, -6],
      });

      measurement.markers.push(marker);

      // Create or update polyline
      if (pointsCount === 1) {
        measurement.layer = L.polyline([point], {
          color: "#2563EB",
          weight: 3,
          dashArray: "6 6",
          interactive: false,
        }).addTo(map);
      } else if (measurement.layer) {
        measurement.layer.setLatLngs(measurement.points);
      }

      setMeasureStats({
        distanceMeters: totalDist,
        areaSqMeters: 0,
        pointsCount,
        isFinished: false,
      });
    },
    [map]
  );

  // ==========================================================
  // AREA CLICK
  // ==========================================================

  const handleAreaClick = useCallback(
    (event: L.LeafletMouseEvent) => {
      const point = event.latlng;
      const measurement = measurementRef.current;
      if (measurement.isFinished) return;

      measurement.points.push(point);
      const pointsCount = measurement.points.length;

      // Vertex marker (interactive: false so clicks pass through)
      const isStart = pointsCount === 1;
      const marker = L.circleMarker(point, {
        radius: isStart ? 6 : 5,
        color: "#10B981",
        fillColor: isStart ? "#10B981" : "#ffffff",
        fillOpacity: 1,
        weight: 2,
        interactive: false,
      }).addTo(map);

      measurement.markers.push(marker);

      // Calculate current area & perimeter
      const currentArea = calculatePolygonArea(measurement.points);
      const perimeter = calculatePathDistance(
        pointsCount > 2 ? [...measurement.points, measurement.points[0]] : measurement.points
      );

      // Tooltip on vertex
      const label =
        pointsCount === 1
          ? "Start"
          : pointsCount >= 3
          ? `Area: ${formatArea(currentArea)}`
          : `Pt ${pointsCount}`;

      marker.bindTooltip(label, {
        permanent: true,
        direction: "top",
        className: "measure-tooltip",
        offset: [0, -6],
      });

      // Create or update polygon
      if (pointsCount === 1) {
        measurement.layer = L.polygon([point], {
          color: "#10B981",
          weight: 3,
          fillColor: "#10B981",
          fillOpacity: 0.2,
          dashArray: "6 6",
          interactive: false,
        }).addTo(map);
      } else if (measurement.layer) {
        measurement.layer.setLatLngs(measurement.points);
      }

      setMeasureStats({
        distanceMeters: perimeter,
        areaSqMeters: currentArea,
        pointsCount,
        isFinished: false,
      });
    },
    [map]
  );

  // ==========================================================
  // IDENTIFY CLICK
  // ==========================================================

  const handleIdentify = useCallback(
    (event: L.LeafletMouseEvent) => {
      const lat = event.latlng.lat;
      const lng = event.latlng.lng;

      const identifyFeature = {
        type: "Feature",
        properties: {
          latitude: lat,
          longitude: lng,
        },
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
      };

      setSelection("Map", identifyFeature, L.marker(event.latlng));
    },
    [setSelection]
  );

  // ==========================================================
  // TOOL SWITCH EFFECT (Cursor & Double-click zoom management)
  // ==========================================================

  useEffect(() => {
    clearMeasurement();
    disableDrawing();

    const isMeasuring =
      activeTool === "measure-distance" || activeTool === "measure-area";

    if (isMeasuring) {
      map.getContainer().style.cursor = "crosshair";
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
    }

    if (
      activeTool === "draw-point" ||
      activeTool === "draw-line" ||
      activeTool === "draw-polygon"
    ) {
      enableDrawing(activeTool);
      map.getContainer().style.cursor = "crosshair";
      return;
    }

    if (activeTool === "identify") {
      map.getContainer().style.cursor = "help";
      return;
    }

    if (!isMeasuring) {
      map.getContainer().style.cursor = "";
    }

    if (activeTool === "none") {
      clearTemporaryLayers();
    }
  }, [
    activeTool,
    map,
    clearMeasurement,
    disableDrawing,
    enableDrawing,
    clearTemporaryLayers,
  ]);

  // ==========================================================
  // MAP CLICK LISTENER
  // ==========================================================

  useEffect(() => {
    const handleMapClick = (event: L.LeafletMouseEvent) => {
      if (activeTool === "measure-distance") {
        handleDistanceClick(event);
      } else if (activeTool === "measure-area") {
        handleAreaClick(event);
      } else if (activeTool === "identify") {
        handleIdentify(event);
      }
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, activeTool, handleDistanceClick, handleAreaClick, handleIdentify]);

  // ==========================================================
  // MOUSEMOVE RUBBER-BAND GUIDE LINE
  // ==========================================================

  useEffect(() => {
    if (activeTool !== "measure-distance" && activeTool !== "measure-area") {
      return;
    }

    const handleMouseMove = (event: L.LeafletMouseEvent) => {
      const measurement = measurementRef.current;
      if (measurement.points.length === 0 || measurement.isFinished) {
        if (measurement.guideLine && map.hasLayer(measurement.guideLine)) {
          map.removeLayer(measurement.guideLine);
          measurement.guideLine = null;
        }
        return;
      }

      const lastPoint = measurement.points[measurement.points.length - 1];
      const currentPoint = event.latlng;

      if (!measurement.guideLine) {
        measurement.guideLine = L.polyline([lastPoint, currentPoint], {
          color: activeTool === "measure-distance" ? "#2563EB" : "#10B981",
          weight: 2,
          dashArray: "4 4",
          opacity: 0.7,
          interactive: false,
        }).addTo(map);
      } else {
        measurement.guideLine.setLatLngs([lastPoint, currentPoint]);
      }
    };

    map.on("mousemove", handleMouseMove);
    return () => {
      map.off("mousemove", handleMouseMove);
    };
  }, [map, activeTool]);

  // ==========================================================
  // DOUBLE CLICK TO FINISH
  // ==========================================================

  useEffect(() => {
    const handleDoubleClick = (e: L.LeafletMouseEvent) => {
      if (activeTool === "measure-distance" || activeTool === "measure-area") {
        L.DomEvent.stopPropagation(e);
        finishMeasurement();
      }
    };

    map.on("dblclick", handleDoubleClick);
    return () => {
      map.off("dblclick", handleDoubleClick);
    };
  }, [map, activeTool, finishMeasurement]);

  // ==========================================================
  // KEYBOARD ESCAPE TO CANCEL
  // ==========================================================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearMeasurement();
        disableDrawing();
        clearTemporaryLayers();
        map.getContainer().style.cursor = "";
        clearTool();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [clearTool, clearMeasurement, disableDrawing, clearTemporaryLayers, map]);

  // ==========================================================
  // CLEANUP ON UNMOUNT
  // ==========================================================

  useEffect(() => {
    return () => {
      clearMeasurement();
      disableDrawing();
      clearTemporaryLayers();
      try {
        if (map.getContainer()) {
          map.getContainer().style.cursor = "";
          map.doubleClickZoom.enable();
        }
      } catch {
        // ignore
      }
    };
  }, [map, clearMeasurement, disableDrawing, clearTemporaryLayers]);

  // ==========================================================
  // RENDER HUD CARD OVER MAP
  // ==========================================================

  const isMeasuring =
    activeTool === "measure-distance" || activeTool === "measure-area";

  if (!isMeasuring) {
    return null;
  }

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center pointer-events-auto select-none animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/95 px-4 py-2.5 shadow-2xl backdrop-blur-md">
        {/* Tool Icon */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          {activeTool === "measure-distance" ? (
            <Ruler size={18} />
          ) : (
            <Square size={18} />
          )}
        </div>

        {/* Readout */}
        <div className="flex flex-col min-w-44">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground">
              {activeTool === "measure-distance"
                ? "Measure Distance"
                : "Measure Area"}
            </span>
            <Badge
              variant="outline"
              className="text-[9px] font-mono py-0 px-1.5"
            >
              {measureStats.pointsCount}{" "}
              {measureStats.pointsCount === 1 ? "point" : "points"}
            </Badge>
            {measureStats.isFinished && (
              <Badge className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 py-0 px-1.5 font-bold">
                Completed
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            {activeTool === "measure-distance" ? (
              <span className="text-sm font-extrabold text-primary font-mono tracking-tight">
                {measureStats.pointsCount > 1
                  ? formatDistance(measureStats.distanceMeters)
                  : "Click map to start"}
              </span>
            ) : (
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                {measureStats.pointsCount >= 3
                  ? formatArea(measureStats.areaSqMeters)
                  : "Click 3+ points for area"}
              </span>
            )}
            {measureStats.pointsCount > 0 && !measureStats.isFinished && (
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                (double-click to finish)
              </span>
            )}
          </div>
        </div>

        <div className="h-6 w-px bg-border/60 mx-1" />

        {/* Actions Bar */}
        <div className="flex items-center gap-1.5">
          {measureStats.pointsCount > 1 && !measureStats.isFinished && (
            <button
              type="button"
              onClick={finishMeasurement}
              className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-all cursor-pointer"
              title="Complete measurement (Double-click map)"
            >
              <Check size={13} />
              <span>Done</span>
            </button>
          )}

          {measureStats.isFinished && (
            <button
              type="button"
              onClick={saveMeasurementAsDrawing}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-xs font-semibold shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
              title="Save into drawings & layer analytics catalog"
            >
              <BookmarkPlus size={13} />
              <span>Save AOI</span>
            </button>
          )}

          {measureStats.pointsCount > 0 && (
            <button
              type="button"
              onClick={clearMeasurement}
              className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/40 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
              title="Reset points"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              clearMeasurement();
              clearTool();
            }}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
            title="Exit measurement tool (Esc)"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CALCULATION HELPERS
// ============================================================

function calculatePathDistance(points: L.LatLng[]): number {
  let dist = 0;
  for (let i = 1; i < points.length; i++) {
    dist += points[i - 1].distanceTo(points[i]);
  }
  return dist;
}

function calculatePolygonArea(points: L.LatLng[]): number {
  if (points.length < 3) return 0;
  try {
    const coords: [number, number][] = points.map((p) => [p.lng, p.lat]);
    // Close the ring
    coords.push([points[0].lng, points[0].lat]);
    const poly = turf.polygon([coords]);
    return turf.area(poly);
  } catch {
    return 0;
  }
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(1)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

function formatArea(squareMeters: number): string {
  if (squareMeters < 10000) {
    return `${squareMeters.toFixed(1)} m²`;
  }
  const ha = squareMeters / 10000;
  if (ha < 100) {
    return `${ha.toFixed(2)} ha`;
  }
  const sqKm = squareMeters / 1000000;
  return `${sqKm.toFixed(2)} km² (${ha.toFixed(1)} ha)`;
}