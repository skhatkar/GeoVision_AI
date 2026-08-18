"use client";

import { create } from "zustand";
import type { Asset } from "@/types/asset";

interface TableState {
  // Selection
  selectedAssetId: number | null;
  selectedAsset: Asset | null;

  // Hover
  hoveredAssetId: number | null;

  setSelectedAsset: (id: number | null) => void;
  setSelectedAssetData: (asset: Asset | null) => void;

  setHoveredAsset: (id: number | null) => void;

  // Search
  search: string;
  setSearch: (value: string) => void;

  // Pagination
  currentPage: number;
  pageSize: number;

  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Sorting
  sortColumn: string | null;
  sortDirection: "asc" | "desc";

  setSort: (
    column: string,
    direction: "asc" | "desc"
  ) => void;

  // Reset
  clearSelection: () => void;
}

export const useTableStore = create<TableState>((set) => ({
  // =========================
  // Selection
  // =========================

  selectedAssetId: null,

  selectedAsset: null,

  setSelectedAsset: (id) =>
    set({
      selectedAssetId: id,
    }),

  setSelectedAssetData: (asset) =>
    set({
      selectedAsset: asset,
    }),

  // =========================
  // Hover
  // =========================

  hoveredAssetId: null,

  setHoveredAsset: (id) =>
    set({
      hoveredAssetId: id,
    }),

  // =========================
  // Search
  // =========================

  search: "",

  setSearch: (value) =>
    set({
      search: value,
      currentPage: 1,
    }),

  // =========================
  // Pagination
  // =========================

  currentPage: 1,

  pageSize: 25,

  setCurrentPage: (page) =>
    set({
      currentPage: page,
    }),

  setPageSize: (size) =>
    set({
      pageSize: size,
      currentPage: 1,
    }),

  // =========================
  // Sorting
  // =========================

  sortColumn: null,

  sortDirection: "asc",

  setSort: (column, direction) =>
    set({
      sortColumn: column,
      sortDirection: direction,
      currentPage: 1,
    }),

  // =========================
  // Clear
  // =========================

  clearSelection: () =>
    set({
      selectedAssetId: null,
      selectedAsset: null,
      hoveredAssetId: null,
    }),
}));