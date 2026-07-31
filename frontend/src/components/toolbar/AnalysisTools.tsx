"use client";

import {
  Ruler,
  Pencil,
} from "lucide-react";

import ToolbarButton from "./ToolbarButton";
import { useToolStore } from "@/store/toolStore";

export default function AnalysisTools() {
  const tool = useToolStore((s) => s.activeTool);
  const setTool = useToolStore((s) => s.setTool);

  return (
    <div className="flex gap-1">

      <ToolbarButton
        icon={<Ruler size={18} />}
        label="Measure Distance"
        active={tool === "measure-distance"}
        onClick={() => setTool("measure-distance")}
      />

      <ToolbarButton
        icon={<Pencil size={18} />}
        label="Draw Polygon"
        active={tool === "draw-polygon"}
        onClick={() => setTool("draw-polygon")}
      />

    </div>
  );
}