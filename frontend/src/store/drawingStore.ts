"use client";

import { create } from "zustand";
import L from "leaflet";

interface DrawingState {
  drawings: L.Layer[];

  addDrawing: (layer: L.Layer) => void;

  removeDrawing: (layer: L.Layer) => void;

  clearDrawings: () => void;
}

export const useDrawingStore = create<DrawingState>((set) => ({
  drawings: [],

  addDrawing: (layer) =>
    set((state) => ({
      drawings: [...state.drawings, layer],
    })),

  removeDrawing: (layer) =>
    set((state) => ({
      drawings: state.drawings.filter((l) => l !== layer),
    })),

  clearDrawings: () =>
    set({
      drawings: [],
    }),
}));
