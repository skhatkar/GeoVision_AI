"use client";

import { create } from "zustand";
import { GISLayer } from "@/types/layer";

interface LayerState {
  layers: GISLayer[];

  addLayer: (layer: GISLayer) => void;

  removeLayer: (id: string) => void;

  toggleLayer: (id: string) => void;

  setOpacity: (id: string, opacity: number) => void;
}

export const useLayerStore = create<LayerState>((set) => ({

  layers: [
  {
    id: "districts",
    name: "District Boundary",
    type: "geojson",
    url: "/data/layers/districts.geojson",
    visible: true,
    opacity: 1,
    color: "#00b4ff",
    weight: 2,
  },

  {
    id: "tehsil",
    name: "Tehsil Boundary",
    type: "geojson",
    url: "/data/layers/Tehsil.geojson",
    visible: false,
    opacity: 1,
    color: "#ff9800",
    weight: 1,
  },
],

  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, layer],
    })),

  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
    })),

  toggleLayer: (id) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id
          ? { ...layer, visible: !layer.visible }
          : layer
      ),
    })),

  setOpacity: (id, opacity) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id
          ? { ...layer, opacity }
          : layer
      ),
    })),

}));