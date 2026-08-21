"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

import L from "leaflet";
import "leaflet-draw";

import { useDrawingStore } from "@/store/drawingStore";

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

    const drawnItems =
      new L.FeatureGroup();

    map.addLayer(drawnItems);

    // ============================================
    // LEAFLET DRAW CONTROL
    // ============================================

    const DrawControl =
      (L.Control as any).Draw;

    if (!DrawControl) {
      console.error(
        "Leaflet Draw is not available. Check leaflet-draw installation."
      );

      return () => {
        map.removeLayer(
          drawnItems
        );
      };
    }

    const drawControl =
      new DrawControl({
        edit: {
          featureGroup:
            drawnItems,
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

    map.addControl(
      drawControl
    );

    // ============================================
    // FEATURE CREATED
    // ============================================

    const handleCreated = (
      event: any
    ) => {
      const layer =
        event.layer as L.Layer;

      drawnItems.addLayer(
        layer
      );

      addDrawing(
        layer
      );

      console.log(
        "Drawing created:",
        layer
      );
    };

    // Leaflet Draw event name
    const DRAW_CREATED =
      "draw:created";

    map.on(
      DRAW_CREATED,
      handleCreated
    );

    // ============================================
    // CLEANUP
    // ============================================

    return () => {
      map.off(
        DRAW_CREATED,
        handleCreated
      );

      map.removeControl(
        drawControl
      );

      map.removeLayer(
        drawnItems
      );
    };
  }, [
    map,
    addDrawing,
  ]);

  return null;
}