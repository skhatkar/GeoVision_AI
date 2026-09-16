"use client";

import { create } from "zustand";
import { getAllAssets, type BackendAsset } from "@/api/assetApi";

interface PanchayatAssetState {
  assets: BackendAsset[];
  selectedPanchayat: string;
  loading: boolean;
  error: string | null;
  loadAssets: () => Promise<void>;
  setSelectedPanchayat: (panchayat: string) => void;
}

export const usePanchayatAssetStore = create<PanchayatAssetState>((set) => ({
  assets: [],
  selectedPanchayat: "",
  loading: false,
  error: null,

  loadAssets: async () => {
    set({ loading: true, error: null });
    try {
      const assets = await getAllAssets();
      set({ assets, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Unable to load assets",
      });
    }
  },

  setSelectedPanchayat: (selectedPanchayat) => set({ selectedPanchayat }),
}));
