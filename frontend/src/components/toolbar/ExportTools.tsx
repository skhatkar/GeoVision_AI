"use client";

import {
  Download,
  Printer,
  Camera,
} from "lucide-react";

import ToolbarButton from "./ToolbarButton";

export default function ExportTools() {
  return (
    <div className="flex gap-1">

      <ToolbarButton
        icon={<Download size={18} />}
        label="Export"
        onClick={() => console.log("Export")}
      />

      <ToolbarButton
        icon={<Printer size={18} />}
        label="Print"
        onClick={() => console.log("Print")}
      />

      <ToolbarButton
        icon={<Camera size={18} />}
        label="Screenshot"
        onClick={() => console.log("Screenshot")}
      />

    </div>
  );
}