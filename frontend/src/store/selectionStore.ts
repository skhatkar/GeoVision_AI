"use client";

import { create } from "zustand";
import type { Layer, LatLngBounds } from "leaflet";

interface SelectionState {
  selectedLayer: string | null;

  selectedFeature: any | null;

  selectedLeafletLayer: Layer | null;

  geometryType: string | null;

  bounds: LatLngBounds | null;

  centroid: [number, number] | null;

  featureArea: number | null;

  featureLength: number | null;

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

    geometryType: null,

    bounds: null,

    centroid: null,

    featureArea: null,

    featureLength: null,

    setSelection: (
      layerId,
      feature,
      leafletLayer
    ) => {

      let bounds: LatLngBounds | null = null;

      let centroid: [number, number] | null = null;

      if ("getBounds" in leafletLayer) {

        bounds = leafletLayer.getBounds();

        const center = bounds.getCenter();

        centroid = [center.lat, center.lng];

      }

      set({

        selectedLayer: layerId,

        selectedFeature: feature,

        selectedLeafletLayer: leafletLayer,

        geometryType:
          feature.geometry?.type ?? null,

        bounds,

        centroid,

        featureArea: null,

        featureLength: null,

      });

    },

    clearSelection: () =>

      set({

        selectedLayer: null,

        selectedFeature: null,

        selectedLeafletLayer: null,

        geometryType: null,

        bounds: null,

        centroid: null,

        featureArea: null,

        featureLength: null,

      }),

  }));