"use client";

import { create } from "zustand";
import type L from "leaflet";
import type { DrawnShapeAnalysisResult } from "@/lib/spatialAnalysis";

export interface DrawnShapeItem {
  id: string;
  name: string;
  layer: any;
  analysis: DrawnShapeAnalysisResult;
  createdAt: string;
}

interface DrawingState {
  drawings: DrawnShapeItem[];
  selectedDrawingId: string | null;

  addDrawing: (item: DrawnShapeItem) => void;
  updateDrawing: (id: string, analysis: DrawnShapeAnalysisResult) => void;
  selectDrawing: (id: string | null) => void;
  removeDrawing: (id: string) => void;
  clearDrawings: () => void;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  drawings: [],
  selectedDrawingId: null,

  addDrawing: (item) =>
    set((state) => ({
      drawings: [item, ...state.drawings],
      selectedDrawingId: item.id,
    })),

  updateDrawing: (id, analysis) =>
    set((state) => ({
      drawings: state.drawings.map((d) =>
        d.id === id ? { ...d, analysis } : d
      ),
    })),

  selectDrawing: (id) =>
    set({
      selectedDrawingId: id,
    }),

  removeDrawing: (id) =>
    set((state) => {
      const target = state.drawings.find((d) => d.id === id);
      if (target && target.layer && typeof target.layer.remove === "function") {
        try {
          target.layer.remove();
        } catch {
          // ignore
        }
      }
      return {
        drawings: state.drawings.filter((d) => d.id !== id),
        selectedDrawingId:
          state.selectedDrawingId === id ? null : state.selectedDrawingId,
      };
    }),

  clearDrawings: () =>
    set((state) => {
      state.drawings.forEach((d) => {
        if (d.layer && typeof d.layer.remove === "function") {
          try {
            d.layer.remove();
          } catch {
            // ignore
          }
        }
      });
      return {
        drawings: [],
        selectedDrawingId: null,
      };
    }),
}));
