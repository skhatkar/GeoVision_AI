"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { Layer, Map } from "leaflet";

import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { useDrawingStore } from "@/store/drawingStore";

// ============================================================
// TYPES
// ============================================================

type GeomanPM = {
  addControls?: (
    options?: Record<string, unknown>
  ) => void;

  removeControls?: () => void;

  enableDraw: (
    shape: string,
    options?: Record<string, unknown>
  ) => void;

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

  const initializedRef =
    useRef(false);

  // ==========================================================
  // INITIALIZE GEOMAN
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      // ------------------------------------------------------
      // Wait until browser environment is ready
      // ------------------------------------------------------

      if (
        typeof window === "undefined"
      ) {
        return;
      }

      // ------------------------------------------------------
      // Wait for Leaflet map to be fully mounted
      // ------------------------------------------------------

      await new Promise<void>(
        (resolve) => {
          requestAnimationFrame(() => {
            resolve();
          });
        }
      );

      if (cancelled) {
        return;
      }

      const geomanMap =
        map as GeomanMap;

      // ------------------------------------------------------
      // Already initialized
      // ------------------------------------------------------

      if (geomanMap.pm) {
        initializedRef.current = true;

        console.log(
          "GeoVision: Geoman already attached."
        );

        return;
      }

      try {
        // ----------------------------------------------------
        // IMPORTANT
        //
        // Geoman is loaded ONLY here.
        //
        // DO NOT import Geoman at module level.
        // ----------------------------------------------------

        await import(
          "@geoman-io/leaflet-geoman-free"
        );

        if (cancelled) {
          return;
        }

        // ----------------------------------------------------
        // Give plugin time to attach itself
        // ----------------------------------------------------

        await new Promise<void>(
          (resolve) => {
            requestAnimationFrame(() => {
              resolve();
            });
          }
        );

        if (cancelled) {
          return;
        }

        const currentMap =
          map as GeomanMap;

        // ----------------------------------------------------
        // Verify Geoman
        // ----------------------------------------------------

        if (!currentMap.pm) {
          console.error(
            "GeoVision: Geoman loaded but map.pm is unavailable."
          );

          return;
        }

        initializedRef.current = true;

        console.log(
          "GeoVision: Geoman initialized successfully."
        );

      } catch (error) {
        console.error(
          "GeoVision: Failed to initialize Geoman:",
          error
        );
      }
    };

    initialize();

    // --------------------------------------------------------
    // CLEANUP
    // --------------------------------------------------------

    return () => {
      cancelled = true;
      initializedRef.current = false;
    };

  }, [map]);

  useEffect(() => {
    const addDrawing = (event: { layer: Layer }) => {
      useDrawingStore.getState().addDrawing(event.layer);
    };
    const removeDrawing = (event: { layer: Layer }) => {
      useDrawingStore.getState().removeDrawing(event.layer);
    };

    map.on("pm:create", addDrawing);
    map.on("pm:remove", removeDrawing);

    return () => {
      map.off("pm:create", addDrawing);
      map.off("pm:remove", removeDrawing);
    };
  }, [map]);

  return null;
}
