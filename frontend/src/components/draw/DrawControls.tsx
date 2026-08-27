"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

import L from "leaflet";
import "leaflet-draw";

import { useDrawingStore } from "@/store/drawingStore";
import { useLayerStore } from "@/store/layerStore";
import { calculateDrawnShapeAnalysis } from "@/lib/spatialAnalysis";

export default function DrawControls() {
  const map = useMap();

  const addDrawing = useDrawingStore(
    (state) => state.addDrawing
  );

  useEffect(() => {
    if (!map) return;

    // ============================================
    // DRAWING LAYER GROUP
    // ============================================

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // ============================================
    // LEAFLET DRAW CONTROL
    // ============================================

    const DrawControl = (L.Control as any).Draw;

    if (!DrawControl) {
      console.warn("Leaflet Draw is not available.");
      return () => {
        map.removeLayer(drawnItems);
      };
    }

    const drawControl = new DrawControl({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        polygon: true,
        polyline: true,
        rectangle: true,
        circle: true,
        marker: true,
        circlemarker: false,
      },
    });

    map.addControl(drawControl);

    // ============================================
    // FEATURE CREATED
    // ============================================

    const handleCreated = (event: any) => {
      const layer = event.layer as L.Layer;
      drawnItems.addLayer(layer);

      const layers = useLayerStore.getState().layers;
      const geoJsonMap = new Map<string, any>(
        Object.entries(useLayerStore.getState().geoJsonData)
      );

      const analysis = calculateDrawnShapeAnalysis(layer, layers, geoJsonMap);
      const id = "draw_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

      addDrawing({
        id,
        name: `Drawing #${useDrawingStore.getState().drawings.length + 1}`,
        layer,
        analysis,
        createdAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      });
    };

    const DRAW_CREATED = "draw:created";
    map.on(DRAW_CREATED, handleCreated);

    return () => {
      map.off(DRAW_CREATED, handleCreated);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map, addDrawing]);

  return null;
}