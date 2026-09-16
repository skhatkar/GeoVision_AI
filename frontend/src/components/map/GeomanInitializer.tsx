"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { Layer, Map as LeafletMap } from "leaflet";

import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

import { useDrawingStore } from "@/store/drawingStore";
import { useLayerStore } from "@/store/layerStore";
import { calculateDrawnShapeAnalysis } from "@/lib/spatialAnalysis";

type GeomanPM = {
  addControls?: (options?: Record<string, unknown>) => void;
  removeControls?: () => void;
  enableDraw: (shape: string, options?: Record<string, unknown>) => void;
  disableDraw: () => void;
  enableGlobalRemovalMode: () => void;
  disableGlobalRemovalMode: () => void;
  enableGlobalEditMode: () => void;
  disableGlobalEditMode: () => void;
};

type GeomanMap = LeafletMap & {
  pm?: GeomanPM;
};

export default function GeomanInitializer() {
  const map = useMap();
  const initializedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 10;

  // Initialize Geoman Controls
  useEffect(() => {
    let cancelled = false;
    let retryInterval: NodeJS.Timeout | null = null;

    const initializeGeoman = (): boolean => {
      if (typeof window === "undefined" || !map) return false;

      const geomanMap = map as GeomanMap;

      if (geomanMap.pm) {
        initializedRef.current = true;

        if (geomanMap.pm.addControls) {
          geomanMap.pm.addControls({
            position: "topleft",
            drawCircle: true,
            drawRectangle: true,
            drawPolygon: true,
            drawMarker: true,
            drawCircleMarker: true,
            drawPolyline: true,
            drawText: false,
            editMode: true,
            dragMode: true,
            cutPolygon: false,
            removalMode: true,
          });
        }

        console.log("GeoVision: Geoman initialized successfully.");
        return true;
      }

      try {
        import("@geoman-io/leaflet-geoman-free").then(() => {
          if (cancelled) return;
          requestAnimationFrame(() => {
            if (cancelled) return;
            if (geomanMap.pm) {
              initializedRef.current = true;
              if (geomanMap.pm.addControls) {
                geomanMap.pm.addControls({
                  position: "topleft",
                  drawCircle: true,
                  drawRectangle: true,
                  drawPolygon: true,
                  drawMarker: true,
                  drawCircleMarker: true,
                  drawPolyline: true,
                  drawText: false,
                  editMode: true,
                  dragMode: true,
                  removalMode: true,
                });
              }
              console.log("GeoVision: Geoman initialized via dynamic import.");
            }
          });
        });
      } catch (error) {
        console.error("GeoVision: Failed to load Geoman:", error);
      }

      return false;
    };

    const initialSuccess = initializeGeoman();

    if (!initialSuccess && !cancelled) {
      retryInterval = setInterval(() => {
        if (cancelled) {
          if (retryInterval) clearInterval(retryInterval);
          return;
        }

        retryCountRef.current++;

        if (retryCountRef.current > maxRetries) {
          if (retryInterval) clearInterval(retryInterval);
          return;
        }

        const success = initializeGeoman();
        if (success && retryInterval) {
          clearInterval(retryInterval);
        }
      }, 300);
    }

    return () => {
      cancelled = true;
      initializedRef.current = false;
      if (retryInterval) {
        clearInterval(retryInterval);
      }
    };
  }, [map]);

  // Event Listeners for Drawings with Real-Time Spatial Analytics
  useEffect(() => {
    if (!map) return;
    const geomanMap = map as GeomanMap;

    const handleCreate = (event: { layer: any }) => {
      const drawnLayer = event.layer;
      const layers = useLayerStore.getState().layers;
      const geoJsonMap = new Map<string, any>(
        Object.entries(useLayerStore.getState().geoJsonData)
      );

      const analysis = calculateDrawnShapeAnalysis(drawnLayer, layers, geoJsonMap);
      const id = "draw_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

      let shapeLabel = `Drawing #${useDrawingStore.getState().drawings.length + 1}`;
      if (analysis.shapeType === "Polygon" || analysis.shapeType === "Rectangle" || analysis.shapeType === "Circle") {
        shapeLabel = `AOI ${analysis.shapeType} #${useDrawingStore.getState().drawings.length + 1}`;
      } else if (analysis.shapeType === "Line") {
        shapeLabel = `Corridor Line #${useDrawingStore.getState().drawings.length + 1}`;
      } else {
        shapeLabel = `Point Marker #${useDrawingStore.getState().drawings.length + 1}`;
      }

      // Attach click event to layer to select it
      drawnLayer.on("click", () => {
        useDrawingStore.getState().selectDrawing(id);
      });

      // Attach edit/drag update listeners
      drawnLayer.on("pm:edit", () => {
        const updatedAnalysis = calculateDrawnShapeAnalysis(
          drawnLayer,
          useLayerStore.getState().layers,
          new Map(Object.entries(useLayerStore.getState().geoJsonData))
        );
        useDrawingStore.getState().updateDrawing(id, updatedAnalysis);
      });

      drawnLayer.on("pm:dragend", () => {
        const updatedAnalysis = calculateDrawnShapeAnalysis(
          drawnLayer,
          useLayerStore.getState().layers,
          new Map(Object.entries(useLayerStore.getState().geoJsonData))
        );
        useDrawingStore.getState().updateDrawing(id, updatedAnalysis);
      });

      useDrawingStore.getState().addDrawing({
        id,
        name: shapeLabel,
        layer: drawnLayer,
        analysis,
        createdAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      });
    };

    const handleRemove = (event: { layer: any }) => {
      const all = useDrawingStore.getState().drawings;
      const found = all.find((d) => d.layer === event.layer);
      if (found) {
        useDrawingStore.getState().removeDrawing(found.id);
      }
    };

    // Leaflet map receives Geoman pm:create and pm:remove events once Geoman initializes
    try {
      map.on("pm:create", handleCreate);
      map.on("pm:remove", handleRemove);
    } catch (err) {
      console.warn("GeoVision: Unable to attach Geoman listeners:", err);
    }

    return () => {
      try {
        map.off("pm:create", handleCreate);
        map.off("pm:remove", handleRemove);
      } catch {
        // ignore
      }
    };
  }, [map]);

  return null;
}