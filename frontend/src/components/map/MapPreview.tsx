"use client";

import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  TileLayer,
  ZoomControl,
  ScaleControl,
  useMap,
} from "react-leaflet";

import { useEffect } from "react";

import { BASEMAPS } from "@/constants/basemaps";
import { useMapStore } from "@/store/mapStore";
import { useLayerStore } from "@/store/layerStore";

import GeoJsonLayer from "./GeoJsonLayer";
import GeomanInitializer from "./GeomanInitializer";
import MouseCoordinates from "./MouseCoordinates";
import MapToolController from "./MapToolController";
import PanchayatAssetMarkers from "./PanchayatAssetMarkers";

// ============================================================
// GLOBAL MAP TYPE
// ============================================================

declare global {
  interface Window {
    __geoVisionMap?: import("leaflet").Map;
  }
}

// ============================================================
// MAP INSTANCE
// ============================================================

function MapInstance() {
  const map = useMap();

  const setMap = useMapStore(
    (state) => state.setMap
  );

  useEffect(() => {
    if (!map) {
      return;
    }

    // --------------------------------------------------------
    // Store map in Zustand
    // --------------------------------------------------------

    setMap(map);

    // --------------------------------------------------------
    // Store exact Leaflet map globally
    // --------------------------------------------------------

    window.__geoVisionMap = map;

    console.log(
      "GeoVision: Leaflet map instance registered."
    );

    // --------------------------------------------------------
    // Cleanup
    // --------------------------------------------------------

    return () => {
      if (
        window.__geoVisionMap === map
      ) {
        window.__geoVisionMap = undefined;
      }

      const currentMap =
        useMapStore.getState().map;

      if (currentMap === map) {
        setMap(null);
      }
    };
  }, [map, setMap]);

  return null;
}

// ============================================================
// MAP PREVIEW
// ============================================================

export default function MapPreview() {
  const basemap =
    useMapStore(
      (state) => state.basemap
    );

  const layers =
    useLayerStore(
      (state) => state.layers
    );

  const currentBasemap =
    BASEMAPS[
    basemap as keyof typeof BASEMAPS
    ] ?? BASEMAPS.osm;

  return (
    <MapContainer
      center={[
        31.1048,
        77.1734,
      ]}
      zoom={8}
      minZoom={6}
      maxZoom={18}
      zoomControl={false}
      doubleClickZoom={false}
      className="h-full w-full"
    >

      {/* ======================================================
          MAP INSTANCE
         ====================================================== */}

      <MapInstance />

      {/* ======================================================
          GEOMAN INITIALIZER
         ====================================================== */}

      <GeomanInitializer />

      {/* ======================================================
          MAP TOOL CONTROLLER
         ====================================================== */}

      <MapToolController />

      {/* ======================================================
          BASEMAP
         ====================================================== */}

      <TileLayer
        attribution={
          currentBasemap.name
        }
        url={
          currentBasemap.url
        }
      />

      <PanchayatAssetMarkers />

      {/* ======================================================
          GIS LAYERS
         ====================================================== */}

      {[...layers]
        .filter(
          (layer) =>
            layer.visible
        )
        .reverse()
        .map(
          (layer) => (
            <GeoJsonLayer
              key={layer.id}
              layer={layer}
            />
          )
        )}

      {/* ======================================================
          MOUSE COORDINATES
         ====================================================== */}

      <MouseCoordinates />

      {/* ======================================================
          MAP CONTROLS
         ====================================================== */}

      <ZoomControl
        position="topright"
      />

      <ScaleControl
        position="bottomleft"
      />

    </MapContainer>
  );
}
