"use client";

import {
  Home,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  RefreshCcw,
} from "lucide-react";

import ToolbarButton from "./ToolbarButton";
import { useToolStore } from "@/store/toolStore";
import { goHome, zoomIn, zoomOut } from "./toolActions";

export default function NavigationTools() {
  const tool = useToolStore((s) => s.activeTool);
  const setTool = useToolStore((s) => s.setTool);

  return (
    <div className="flex gap-1">

      <ToolbarButton
        icon={<Home size={18} />}
        label="Home"
        onClick={() => {
          console.log("Toolbar Home clicked");
          goHome();
        }}
      />

      <ToolbarButton
        icon={<ZoomIn size={18} />}
        label="Zoom In"
        onClick={() => {
          console.log("Toolbar Zoom In clicked");
          zoomIn();
        }}
      />

      <ToolbarButton
        icon={<ZoomOut size={18} />}
        label="Zoom Out"
        onClick={() => {
          console.log("Toolbar Zoom Out clicked");
          zoomOut();
        }}
      />

      <ToolbarButton
        icon={<MousePointer2 size={18} />}
        label="Pan"
        active={tool === "pan"}
        onClick={() => setTool("pan")}
      />

      <ToolbarButton
        icon={<RefreshCcw size={18} />}
        label="Refresh"
        onClick={() => window.location.reload()}
      />

    </div>
  );
}