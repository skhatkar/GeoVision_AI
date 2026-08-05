"use client";

import { create } from "zustand";

interface TableState {

  selectedAssetId: number | null;

  hoveredAssetId: number | null;

  setSelectedAsset: (id: number | null) => void;

  setHoveredAsset: (id: number | null) => void;

}

export const useTableStore = create<TableState>((set) => ({

  selectedAssetId: null,

  hoveredAssetId: null,

  setSelectedAsset: (id) =>
    set({
      selectedAssetId: id,
    }),

  setHoveredAsset: (id) =>
    set({
      hoveredAssetId: id,
    }),

}));