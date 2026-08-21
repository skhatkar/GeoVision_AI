"use client";

import { create } from "zustand";

export type ActiveTool =
  | "pan"
  | "select"
  | "identify"
  | "measure-distance"
  | "measure-area"
  | "draw-point"
  | "draw-line"
  | "draw-polygon"
  | "search"
  | "none";

interface ToolState {
  activeTool: ActiveTool;

  setTool: (tool: ActiveTool) => void;

  clearTool: () => void;
}

export const useToolStore = create<ToolState>(
  (set) => ({
    activeTool: "pan",

    setTool: (tool) =>
      set({
        activeTool: tool,
      }),

    clearTool: () =>
      set({
        activeTool: "none",
      }),
  })
);