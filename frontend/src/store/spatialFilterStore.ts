"use client";

import { create } from "zustand";
import {
  getAdministrativeHierarchy,
  getFilteredAssets,
  type HierarchyResponse,
  type HierarchyDistrict,
  type HierarchyBlock,
  type HierarchyPanchayat,
  type FilteredAsset,
} from "@/api/assetApi";

interface SpatialFilterState {
  hierarchy: HierarchyResponse | null;
  selectedDistrict: string;
  selectedBlock: string;
  selectedPanchayat: string;
  selectedDepartment: string;
  filteredAssets: FilteredAsset[];
  selectedAsset: FilteredAsset | null;
  loadingHierarchy: boolean;
  loadingAssets: boolean;
  error: string | null;

  // Actions
  loadHierarchy: () => Promise<void>;
  setDistrict: (district: string) => Promise<void>;
  setBlock: (block: string) => Promise<void>;
  setPanchayat: (panchayat: string) => Promise<void>;
  setDepartment: (department: string) => void;
  setSelectedAsset: (asset: FilteredAsset | null) => void;
  resetFilter: () => Promise<void>;
  fetchAssets: () => Promise<void>;

  // Getters
  getAvailableBlocks: () => HierarchyBlock[];
  getAvailablePanchayats: () => HierarchyPanchayat[];
  getDepartmentCounts: () => Record<string, number>;
}

export const useSpatialFilterStore = create<SpatialFilterState>((set, get) => ({
  hierarchy: null,
  selectedDistrict: "",
  selectedBlock: "",
  selectedPanchayat: "",
  selectedDepartment: "",
  filteredAssets: [],
  selectedAsset: null,
  loadingHierarchy: false,
  loadingAssets: false,
  error: null,

  loadHierarchy: async () => {
    if (get().hierarchy) return; // already loaded
    set({ loadingHierarchy: true, error: null });
    try {
      const hierarchy = await getAdministrativeHierarchy();
      set({ hierarchy, loadingHierarchy: false });
    } catch (err: any) {
      set({
        loadingHierarchy: false,
        error: err?.message || "Failed to load administrative hierarchy",
      });
    }
  },

  setDistrict: async (district: string) => {
    set({
      selectedDistrict: district,
      selectedBlock: "",
      selectedPanchayat: "",
      selectedDepartment: "",
    });
    await get().fetchAssets();
  },

  setBlock: async (block: string) => {
    set({
      selectedBlock: block,
      selectedPanchayat: "",
      selectedDepartment: "",
    });
    await get().fetchAssets();
  },

  setPanchayat: async (panchayat: string) => {
    set({
      selectedPanchayat: panchayat,
      selectedDepartment: "",
    });
    await get().fetchAssets();
  },

  setDepartment: (department: string) => {
    set({ selectedDepartment: department });
  },

  setSelectedAsset: (asset: FilteredAsset | null) => {
    set({ selectedAsset: asset });
  },

  resetFilter: async () => {
    set({
      selectedDistrict: "",
      selectedBlock: "",
      selectedPanchayat: "",
      selectedDepartment: "",
      filteredAssets: [],
      selectedAsset: null,
      error: null,
    });
  },

  fetchAssets: async () => {
    const { selectedDistrict, selectedBlock, selectedPanchayat } = get();
    if (!selectedDistrict && !selectedBlock && !selectedPanchayat) {
      set({ filteredAssets: [] });
      return;
    }

    set({ loadingAssets: true, error: null });
    try {
      const assets = await getFilteredAssets({
        district: selectedDistrict || undefined,
        block: selectedBlock || undefined,
        panchayat: selectedPanchayat || undefined,
      });
      set({ filteredAssets: assets, loadingAssets: false });
    } catch (err: any) {
      set({
        loadingAssets: false,
        error: err?.message || "Failed to query assets for the selected location",
      });
    }
  },

  getAvailableBlocks: () => {
    const { hierarchy, selectedDistrict } = get();
    if (!hierarchy || !selectedDistrict) return [];
    const dist = hierarchy.districts.find(
      (d) => d.name.toLowerCase() === selectedDistrict.toLowerCase()
    );
    return dist ? dist.blocks : [];
  },

  getAvailablePanchayats: () => {
    const blocks = get().getAvailableBlocks();
    const { selectedBlock } = get();
    if (!selectedBlock) return [];
    const blk = blocks.find(
      (b) => b.name.toLowerCase() === selectedBlock.toLowerCase()
    );
    return blk ? blk.panchayats : [];
  },

  getDepartmentCounts: () => {
    const { filteredAssets } = get();
    const counts: Record<string, number> = {};
    for (const asset of filteredAssets) {
      const attrs = asset.attributes || {};
      const dept =
        attrs.department_name ||
        attrs.department_display ||
        attrs.departme_1 ||
        "General";
      counts[dept] = (counts[dept] || 0) + 1;
    }
    return counts;
  },
}));
