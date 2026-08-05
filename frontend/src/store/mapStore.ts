"use client";

import { create } from "zustand";
import type { Map, GeoJSON } from "leaflet";

interface MapState {
  map: Map | null;

  setMap: (map: Map) => void;

  basemap: string;

  setBasemap: (basemap: string) => void;

  geoJsonLayers: Record<string, GeoJSON>;

  registerLayer: (
    id: string,
    layer: GeoJSON
  ) => void;

  unregisterLayer: (
    id: string
  ) => void;
}

export const useMapStore = create<MapState>((set) => ({
  map: null,

  setMap: (map) =>
    set({
      map,
    }),

  basemap: "osm",

  setBasemap: (basemap) =>
    set({
      basemap,
    }),

  geoJsonLayers: {},

  registerLayer: (id, layer) =>
    set((state) => ({
      geoJsonLayers: {
        ...state.geoJsonLayers,
        [id]: layer,
      },
    })),

  unregisterLayer: (id) =>
    set((state) => {
      const copy = {
        ...state.geoJsonLayers,
      };

      delete copy[id];

      return {
        geoJsonLayers: copy,
      };
    }),
}));