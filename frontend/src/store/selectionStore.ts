"use client";

import { create } from "zustand";

interface SelectionState {
  selectedLayer: string | null;

  selectedFeature: any | null;

  setSelection: (
    layerId: string,
    feature: any
  ) => void;

  clearSelection: () => void;
}

export const useSelectionStore =
  create<SelectionState>((set) => ({

    selectedLayer: null,

    selectedFeature: null,

    setSelection: (layerId, feature) =>
      set({
        selectedLayer: layerId,
        selectedFeature: feature,
      }),

    clearSelection: () =>
      set({
        selectedLayer: null,
        selectedFeature: null,
      }),

}));