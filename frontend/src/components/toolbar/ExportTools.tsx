"use client";

import {
  Download,
  Printer,
  Camera,
} from "lucide-react";

import ToolbarButton from "./ToolbarButton";
import { useMapStore } from "@/store/mapStore";
import { useSelectionStore } from "@/store/selectionStore";

export default function ExportTools() {
  const map = useMapStore((state) => state.map);
  const selectedFeature = useSelectionStore((state) => state.selectedFeature);

  const exportFeature = () => {
    if (!selectedFeature) {
      alert("Select a feature before exporting it.");
      return;
    }

    const blob = new Blob([JSON.stringify(selectedFeature, null, 2)], {
      type: "application/geo+json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "selected-feature.geojson";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const printMap = () => window.print();

  const screenshotVectors = () => {
    const canvas = map?.getContainer().querySelector("canvas");
    if (!canvas) {
      alert("No vector canvas is available to capture yet.");
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = "map-vectors.png";
    anchor.click();
  };

  return (
    <div className="flex gap-1">

      <ToolbarButton
        icon={<Download size={18} />}
        label="Export"
        onClick={exportFeature}
      />

      <ToolbarButton
        icon={<Printer size={18} />}
        label="Print"
        onClick={printMap}
      />

      <ToolbarButton
        icon={<Camera size={18} />}
        label="Save vector overlay"
        onClick={screenshotVectors}
      />

    </div>
  );
}
