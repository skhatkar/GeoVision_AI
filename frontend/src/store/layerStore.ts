"use client";

import { create } from "zustand";
import { GISLayer } from "@/types/layer";

interface LayerState {
  layers: GISLayer[];

  setLayers: (layers: GISLayer[]) => void;

  toggleLayer: (id: string) => void;

  setOpacity: (id: string, opacity: number) => void;

  setColor: (id: string, color: string) => void;

  setWeight: (id: string, weight: number) => void;

  moveLayer: (from: number, to: number) => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  // Temporary default layers (will be replaced by backend)
  layers: [
    {
      id: "districts",
      name: "District Boundary",
      type: "geojson",
      url: "/data/layers/districts.geojson",

      visible: true,

      opacity: 1,

      color: "#ff0000",
      fillColor: "#ff0000",

      weight: 2,
    },

    {
      id: "tehsil",
      name: "Tehsil Boundary",
      type: "geojson",
      url: "/data/layers/Tehsil.geojson",

      visible: false,

      opacity: 1,

      color: "#4CAF50",
      fillColor: "#4CAF50",

      weight: 2,
    },
  ],

  // Replace all layers from backend
  setLayers: (layers) =>
    set({
      layers,
    }),

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