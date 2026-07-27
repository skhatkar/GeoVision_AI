"use client";

import { create } from "zustand";
import { defaultLayers } from "@/data/layers";

interface LayerStore {
  layers: typeof defaultLayers;

  toggleLayer: (id: string) => void;

  setOpacity: (id: string, opacity: number) => void;
}

export const useLayerStore = create<LayerStore>((set) => ({
  layers: defaultLayers,

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