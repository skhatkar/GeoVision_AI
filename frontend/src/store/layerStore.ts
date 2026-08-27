"use client";

import { create } from "zustand";
import { GISLayer } from "@/types/layer";

interface LayerState {
  layers: GISLayer[];

  // GeoJSON data cache for spatial queries
  geoJsonData: Record<string, any>;
  setLayerGeoJsonData: (id: string, data: any) => void;

  // Replace all layers
  setLayers: (layers: GISLayer[]) => void;

  // Add layer
  addLayer: (layer: GISLayer) => void;

  // Remove layer
  removeLayer: (id: string) => void;

  // Get single layer
  getLayer: (id: string) => GISLayer | undefined;

  // Toggle visibility
  toggleLayer: (id: string) => void;

  // Change opacity
  setOpacity: (
    id: string,
    opacity: number
  ) => void;

  // Change color
  setColor: (
    id: string,
    color: string
  ) => void;

  // Change line width / border weight
  setWeight: (
    id: string,
    weight: number
  ) => void;

  // Change icon for point features
  setIcon: (
    id: string,
    icon: string
  ) => void;

  // Change point / icon size
  setPointSize: (
    id: string,
    size: number
  ) => void;

  // Update multiple style properties at once
  updateLayerStyle: (
    id: string,
    style: Partial<GISLayer>
  ) => void;

  // Reorder layers
  moveLayer: (
    from: number,
    to: number
  ) => void;
}

export const useLayerStore = create<LayerState>((set, get) => ({
  layers: [
    {
      id: "districts",
      name: "District Boundary",
      type: "geojson",
      url: "/data/layers/districts.geojson",

      visible: true,

      opacity: 1,

      color: "#2563EB",
      fillColor: "#2563EB",

      weight: 2,
    },

    {
      id: "tehsil",
      name: "Tehsil Boundary",
      type: "geojson",
      url: "/data/layers/Tehsil.geojson",

      visible: false,

      opacity: 1,

      color: "#10B981",
      fillColor: "#10B981",

      weight: 2,
    },
  ],

  geoJsonData: {},

  setLayerGeoJsonData: (id, data) =>
    set((state) => ({
      geoJsonData: {
        ...state.geoJsonData,
        [id]: data,
      },
    })),

  // Replace all layers
  setLayers: (layers) =>
    set({
      layers,
    }),

  // Add one layer
  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, layer],
    })),

  // Remove one layer
  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter(
        (layer) => layer.id !== id
      ),
    })),

  // Get one layer
  getLayer: (id) =>
    get().layers.find(
      (layer) => layer.id === id
    ),

  // Toggle visibility
  toggleLayer: (id) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id
          ? {
            ...layer,
            visible: !layer.visible,
          }
          : layer
      ),
    })),

  // Change opacity
  setOpacity: (id, opacity) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id
          ? {
            ...layer,
            opacity,
          }
          : layer
      ),
    })),

  // Change color
  setColor: (id, color) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id
          ? {
            ...layer,
            color,
            fillColor: color,
          }
          : layer
      ),
    })),

  // Change line width
  setWeight: (id, weight) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id
          ? {
            ...layer,
            weight,
          }
          : layer
      ),
    })),

  // Change icon
  setIcon: (id, icon) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id
          ? {
            ...layer,
            icon,
          }
          : layer
      ),
    })),

  // Change point size
  setPointSize: (id, pointSize) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id
          ? {
            ...layer,
            pointSize,
          }
          : layer
      ),
    })),

  // Update multiple style properties
  updateLayerStyle: (id, style) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id
          ? {
            ...layer,
            ...style,
          }
          : layer
      ),
    })),

  // Reorder layers
  moveLayer: (from, to) =>
    set((state) => {
      const layers = [...state.layers];

      if (
        from < 0 ||
        to < 0 ||
        from >= layers.length ||
        to >= layers.length
      ) {
        return state;
      }

      const [item] = layers.splice(from, 1);

      if (!item) return state;

      layers.splice(to, 0, item);

      return {
        layers,
      };
    }),
}));