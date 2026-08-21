"use client";

import {
  SquareDashedMousePointer,
  Search,
} from "lucide-react";

import ToolbarButton from "./ToolbarButton";

import {
  useToolStore,
} from "@/store/toolStore";

export default function SelectionTools() {

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

      <ToolbarButton
        icon={
          <SquareDashedMousePointer
            size={18}
          />
        }
        label="Select"
        active={
          tool === "select"
        }
        onClick={() => {
          setTool("select");
        }}
      />

      <ToolbarButton
        icon={
          <Search size={18} />
        }
        label="Identify"
        active={
          tool === "identify"
        }
        onClick={() => {
          setTool("identify");
        }}
      />

    </div>
  );
}