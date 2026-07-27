"use client";

import { create } from "zustand";

interface MapStore {
  basemap: string;

  setBasemap: (name: string) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  basemap: "osm",

  setBasemap: (name) =>
    set({
      basemap: name,
    }),
}));