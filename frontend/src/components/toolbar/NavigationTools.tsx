"use client";

import {
  Home,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  RefreshCcw,
} from "lucide-react";

import ToolbarButton from "./ToolbarButton";

import {
  useToolStore,
} from "@/store/toolStore";

import {
  goHome,
  zoomIn,
  zoomOut,
} from "./toolActions";

export default function NavigationTools() {

  const tool =
    useToolStore(
      (state) =>
        state.activeTool
    );

  const setTool =
    useToolStore(
      (state) =>
        state.setTool
    );

  return (
    <div className="flex gap-1">

      {/* ====================================== */}
      {/* HOME */}
      {/* ====================================== */}

      <ToolbarButton
        icon={
          <Home size={18} />
        }
        label="Home"
        onClick={() => {
          goHome();
        }}
      />

      {/* ====================================== */}
      {/* ZOOM IN */}
      {/* ====================================== */}

      <ToolbarButton
        icon={
          <ZoomIn size={18} />
        }
        label="Zoom In"
        onClick={() => {
          zoomIn();
        }}
      />

      {/* ====================================== */}
      {/* ZOOM OUT */}
      {/* ====================================== */}

      <ToolbarButton
        icon={
          <ZoomOut size={18} />
        }
        label="Zoom Out"
        onClick={() => {
          zoomOut();
        }}
      />

      {/* ====================================== */}
      {/* PAN */}
      {/* ====================================== */}

      <ToolbarButton
        icon={
          <MousePointer2
            size={18}
          />
        }
        label="Pan"
        active={
          tool === "pan"
        }
        onClick={() => {
          setTool("pan");
        }}
      />

      {/* ====================================== */}
      {/* REFRESH */}
      {/* ====================================== */}

      <ToolbarButton
        icon={
          <RefreshCcw
            size={18}
          />
        }
        label="Refresh"
        onClick={() => {
          window.location.reload();
        }}
      />

    </div>
  );
}