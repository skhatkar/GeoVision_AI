"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { Layer, Map } from "leaflet";

// ✅ FIX 1: Import at module level (not dynamically)
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

import { useDrawingStore } from "@/store/drawingStore";

// ============================================================
// TYPES
// ============================================================

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

type GeomanMap = Map & {
  pm?: GeomanPM;
};

// ============================================================
// COMPONENT
// ============================================================

export default function GeomanInitializer() {
  const map = useMap();
  const initializedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 10;

  // ==========================================================
  // INITIALIZE GEOMAN
  // ==========================================================

  useEffect(() => {
    let cancelled = false;
    let retryInterval: NodeJS.Timeout | null = null;

    const initializeGeoman = (): boolean => {
      // ------------------------------------------------------
      // Wait until browser environment is ready
      // ------------------------------------------------------

      if (typeof window === "undefined") {
        return false;
      }

      // ------------------------------------------------------
      // Check if map is ready
      // ------------------------------------------------------

      if (!map) {
        console.warn("GeoVision: Map not ready yet");
        return false;
      }

      const geomanMap = map as GeomanMap;

      // ------------------------------------------------------
      // Already initialized
      // ------------------------------------------------------

      if (geomanMap.pm) {
        initializedRef.current = true;

        // ✅ FIX 2: Add controls if not already added
        if (geomanMap.pm.addControls) {
          geomanMap.pm.addControls({
            position: "topleft",
            drawCircle: true,
            drawRectangle: true,
            drawPolygon: true,
            drawMarker: true,
            drawCircleMarker: true,
            drawPolyline: true,
            drawText: true,
          });
        }

        console.log("GeoVision: Geoman initialized successfully.");
        return true;
      }

      // ✅ FIX 3: Try to force attach Geoman
      try {
        // Dynamic import as fallback
        import("@geoman-io/leaflet-geoman-free").then(() => {
          if (cancelled) return;

          // Wait for next frame to let plugin attach
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
                  drawText: true,
                });
              }

              console.log("GeoVision: Geoman initialized via dynamic import.");
            } else {
              console.warn("GeoVision: Geoman still not attached after import");
            }
          });
        });
      } catch (error) {
        console.error("GeoVision: Failed to load Geoman:", error);
      }

      return false;
    };

    // --------------------------------------------------------
    // Try initialization immediately
    // --------------------------------------------------------

    const initialSuccess = initializeGeoman();

    // --------------------------------------------------------
    // Retry if not successful
    // --------------------------------------------------------

    if (!initialSuccess && !cancelled) {
      retryInterval = setInterval(() => {
        if (cancelled) {
          if (retryInterval) clearInterval(retryInterval);
          return;
        }

        retryCountRef.current++;

        if (retryCountRef.current > maxRetries) {
          console.warn("GeoVision: Max retries reached. Geoman may not attach.");
          if (retryInterval) clearInterval(retryInterval);
          return;
        }

        const success = initializeGeoman();
        if (success && retryInterval) {
          clearInterval(retryInterval);
        }
      }, 300);
    }

    // --------------------------------------------------------
    // CLEANUP
    // --------------------------------------------------------

    return () => {
      cancelled = true;
      initializedRef.current = false;
      if (retryInterval) {
        clearInterval(retryInterval);
      }
    };
  }, [map]);

  // ==========================================================
  // EVENT HANDLERS
  // ==========================================================

  useEffect(() => {
    const addDrawing = (event: { layer: Layer }) => {
      useDrawingStore.getState().addDrawing(event.layer);
    };

    const removeDrawing = (event: { layer: Layer }) => {
      useDrawingStore.getState().removeDrawing(event.layer);
    };

    // ✅ FIX 4: Only attach events if map.pm exists
    const geomanMap = map as GeomanMap;

    if (geomanMap.pm) {
      map.on("pm:create", addDrawing);
      map.on("pm:remove", removeDrawing);
    }

    return () => {
      map.off("pm:create", addDrawing);
      map.off("pm:remove", removeDrawing);
    };
  }, [map]);

  return null;
}