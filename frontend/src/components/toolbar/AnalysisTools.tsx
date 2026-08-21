"use client";

import {
  Ruler,
  Square,
  Pencil,
} from "lucide-react";

import ToolbarButton from "./ToolbarButton";

import { useToolStore } from "@/store/toolStore";

export default function AnalysisTools() {
  const tool = useToolStore(
    (state) => state.activeTool
  );

  const setTool = useToolStore(
    (state) => state.setTool
  );

  return (
    <div className="flex gap-1">

      {/* ====================================== */}
      {/* MEASURE DISTANCE */}
      {/* ====================================== */}

      <ToolbarButton
        icon={
          <Ruler size={18} />
        }
        label="Measure Distance"
        active={
          tool === "measure-distance"
        }
        onClick={() => {

          if (
            tool === "measure-distance"
          ) {
            setTool("pan");
            return;
          }

          setTool(
            "measure-distance"
          );
        }}
      />

      {/* ====================================== */}
      {/* MEASURE AREA */}
      {/* ====================================== */}

      <ToolbarButton
        icon={
          <Square size={18} />
        }
        label="Measure Area"
        active={
          tool === "measure-area"
        }
        onClick={() => {

          if (
            tool === "measure-area"
          ) {
            setTool("pan");
            return;
          }

          setTool(
            "measure-area"
          );
        }}
      />

      {/* ====================================== */}
      {/* DRAW POLYGON */}
      {/* ====================================== */}

      <ToolbarButton
        icon={
          <Pencil size={18} />
        }
        label="Draw Polygon"
        active={
          tool === "draw-polygon"
        }
        onClick={() => {

          if (
            tool === "draw-polygon"
          ) {
            setTool("pan");
            return;
          }

          setTool(
            "draw-polygon"
          );
        }}
      />

    </div>
  );
}