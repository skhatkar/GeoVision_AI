"use client";

import { create } from "zustand";
import type { Layer } from "leaflet";

interface SelectionState {
  selectedLayer: string | null;

  selectedFeature: any | null;

  selectedLeafletLayer: Layer | null;

  setSelection: (
    layerId: string,
    feature: any,
    leafletLayer: Layer
  ) => void;

  clearSelection: () => void;
}

export const useSelectionStore =
  create<SelectionState>((set) => ({
    selectedLayer: null,

    selectedFeature: null,

    selectedLeafletLayer: null,

    setSelection: (
      layerId,
      feature,
      leafletLayer
    ) =>
      set({
        selectedLayer: layerId,
        selectedFeature: feature,
        selectedLeafletLayer: leafletLayer,
      }),

    clearSelection: () =>
      set({
        selectedLayer: null,
        selectedFeature: null,
        selectedLeafletLayer: null,
      }),
  }));