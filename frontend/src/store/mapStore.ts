"use client";

import { create } from "zustand";
import type {
  Map,
  GeoJSON,
  Layer,
} from "leaflet";

interface MapState {
  // ============================================
  // LEAFLET MAP
  // ============================================

  map: Map | null;

  setMap: (
    map: Map | null
  ) => void;

  // ============================================
  // BASEMAP
  // ============================================

  basemap: string;

  setBasemap: (
    basemap: string
  ) => void;

  // ============================================
  // GEOJSON LAYERS
  // ============================================

  geoJsonLayers: Record<
    string,
    GeoJSON
  >;

  registerLayer: (
    id: string,
    layer: GeoJSON
  ) => void;

  unregisterLayer: (
    id: string
  ) => void;

  getLayer: (
    id: string
  ) => GeoJSON | undefined;

  zoomToLayer: (
    id: string
  ) => void;

  // ============================================
  // INDIVIDUAL ASSET LAYERS
  // ============================================

  assetLayers: Record<
    number,
    Layer
  >;

  registerAssetLayer: (
    assetId: number,
    layer: Layer
  ) => void;

  unregisterAssetLayer: (
    assetId: number
  ) => void;

  getAssetLayer: (
    assetId: number
  ) => Layer | undefined;

  zoomToAsset: (
    assetId: number
  ) => void;

  clearAssetLayers: () => void;

  // ============================================
  // CLEAR EVERYTHING
  // ============================================

  clearLayers: () => void;
}

export const useMapStore =
  create<MapState>((set, get) => ({

    // ============================================
    // MAP
    // ============================================

    map: null,

    setMap: (map) =>
      set({
        map,
      }),

    // ============================================
    // BASEMAP
    // ============================================

    basemap: "osm",

    setBasemap: (basemap) =>
      set({
        basemap,
      }),

    // ============================================
    // GEOJSON LAYERS
    // ============================================

    geoJsonLayers: {},

    registerLayer: (
      id,
      layer
    ) =>
      set((state) => ({
        geoJsonLayers: {
          ...state.geoJsonLayers,
          [id]: layer,
        },
      })),

    unregisterLayer: (
      id
    ) =>
      set((state) => {

        const copy = {
          ...state.geoJsonLayers,
        };

        delete copy[id];

        return {
          geoJsonLayers: copy,
        };

      }),

    getLayer: (
      id
    ) => {

      return get()
        .geoJsonLayers[id];

    },

    zoomToLayer: (
      id
    ) => {

      const map =
        get().map;

      const layer =
        get().geoJsonLayers[id];

      if (!map || !layer) {
        console.warn(
          `Cannot zoom to layer: ${id}`
        );

        return;
      }

      try {

        const bounds =
          layer.getBounds();

        if (!bounds.isValid()) {

          console.warn(
            `Layer ${id} has invalid bounds`
          );

          return;
        }

        map.fitBounds(
          bounds,
          {
            padding: [40, 40],
            animate: true,
          }
        );

      } catch (error) {

        console.error(
          `Failed to zoom to layer ${id}:`,
          error
        );

      }

    },

    // ============================================
    // ASSET LAYERS
    // ============================================

    assetLayers: {},

    registerAssetLayer: (
      assetId,
      layer
    ) =>
      set((state) => ({
        assetLayers: {
          ...state.assetLayers,
          [assetId]: layer,
        },
      })),

    unregisterAssetLayer: (
      assetId
    ) =>
      set((state) => {

        const copy = {
          ...state.assetLayers,
        };

        delete copy[assetId];

        return {
          assetLayers: copy,
        };

      }),

    getAssetLayer: (
      assetId
    ) => {

      return get()
        .assetLayers[assetId];

    },

    zoomToAsset: (
      assetId
    ) => {

      const map =
        get().map;

      const layer =
        get().assetLayers[
          assetId
        ];

      if (!map || !layer) {

        console.warn(
          `Cannot zoom to asset: ${assetId}`
        );

        return;
      }

      try {

        // ========================================
        // Layers with bounds
        // ========================================

        if (
          "getBounds" in layer &&
          typeof (
            layer as any
          ).getBounds === "function"
        ) {

          const bounds =
            (layer as any).getBounds();

          if (
            bounds &&
            bounds.isValid()
          ) {

            map.fitBounds(
              bounds,
              {
                padding: [60, 60],
                maxZoom: 17,
                animate: true,
              }
            );

            return;
          }

        }

        // ========================================
        // Point layers
        // ========================================

        if (
          "getLatLng" in layer &&
          typeof (
            layer as any
          ).getLatLng === "function"
        ) {

          const latlng =
            (layer as any).getLatLng();

          if (latlng) {

            map.flyTo(
              latlng,
              Math.max(
                map.getZoom(),
                15
              ),
              {
                animate: true,
                duration: 0.8,
              }
            );

            return;
          }

        }

        console.warn(
          `Asset ${assetId} has no zoomable geometry`
        );

      } catch (error) {

        console.error(
          `Failed to zoom to asset ${assetId}:`,
          error
        );

      }

    },

    // ============================================
    // CLEAR ASSET LAYERS
    // ============================================

    clearAssetLayers: () =>
      set({
        assetLayers: {},
      }),

    // ============================================
    // CLEAR EVERYTHING
    // ============================================

    clearLayers: () =>
      set({
        geoJsonLayers: {},
        assetLayers: {},
      }),

  }));