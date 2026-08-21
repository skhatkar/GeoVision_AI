"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MousePointer2,
  Move,
  ZoomIn,
  ZoomOut,
  LocateFixed,
  Ruler,
  Pencil,
  Pentagon,
  Circle,
  RectangleHorizontal,
  MapPin,
  SquarePen,
  Trash2,
  Search,
  Layers3,
  BrainCircuit,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react";

import BasemapSwitcher from "./BasemapSwitcher";

import {
  zoomIn,
  zoomOut,
  goHome,
} from "@/components/toolbar/toolActions";

import {
  drawMarker,
  drawPolyline,
  drawPolygon,
  drawRectangle,
  drawCircle,
  editFeatures,
  deleteFeatures,
} from "./DrawingActions";
import { useToolStore } from "@/store/toolStore";
import { useLayerStore } from "@/store/layerStore";
import { useMapStore } from "@/store/mapStore";
import { useSelectionStore } from "@/store/selectionStore";

export default function TopToolbar() {
  const router = useRouter();
  const setTool = useToolStore((state) => state.setTool);
  const layers = useLayerStore((state) => state.layers);
  const setLayers = useLayerStore((state) => state.setLayers);
  const selectedFeature = useSelectionStore((state) => state.selectedFeature);
  const [query, setQuery] = useState("");

  const searchLayers = () => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return;

    const layer = layers.find((item) =>
      item.name.toLowerCase().includes(normalizedQuery)
    );

    if (!layer) {
      alert("No matching layer is currently loaded on the map.");
      return;
    }

    if (!layer.visible) {
      setLayers(
        layers.map((item) =>
          item.id === layer.id ? { ...item, visible: true } : item
        )
      );
    }

    window.setTimeout(() => {
      useMapStore.getState().zoomToLayer(layer.id);
    }, 0);
  };

  const exportSelectedFeature = () => {
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

  const tools = [
    {
      icon: MousePointer2,
      label: "Select",
      action: () => setTool("select"),
    },

    {
      icon: Move,
      label: "Pan",
      action: () => setTool("pan"),
    },

    {
      icon: ZoomIn,
      label: "Zoom In",
      action: zoomIn,
    },

    {
      icon: ZoomOut,
      label: "Zoom Out",
      action: zoomOut,
    },

    {
      icon: LocateFixed,
      label: "Home",
      action: goHome,
    },

    {
      icon: Ruler,
      label: "Measure",
      action: () => setTool("measure-distance"),
    },

    {
      icon: MapPin,
      label: "Marker",
      action: drawMarker,
    },

    {
      icon: Pencil,
      label: "Polyline",
      action: drawPolyline,
    },

    {
      icon: Pentagon,
      label: "Polygon",
      action: drawPolygon,
    },

    {
      icon: RectangleHorizontal,
      label: "Rectangle",
      action: drawRectangle,
    },

    {
      icon: Circle,
      label: "Circle",
      action: drawCircle,
    },

    {
      icon: SquarePen,
      label: "Edit",
      action: editFeatures,
    },

    {
      icon: Trash2,
      label: "Delete",
      action: deleteFeatures,
    },
  ];

  return (
    <header className="flex items-center justify-between border-b bg-background px-4 py-3">

      {/* Left Toolbar */}
      <div className="flex items-center gap-2">

        <BasemapSwitcher />

        {tools.map((tool) => (
          <button
            key={tool.label}
            title={tool.label}
            onClick={tool.action}
            className="rounded-lg border p-2 transition hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-800"
          >
            <tool.icon className="h-5 w-5" />
          </button>
        ))}

      </div>

      {/* Search */}

      <div className="flex w-[340px] items-center rounded-lg border px-3">

        <Search className="mr-2 h-4 w-4 text-gray-400" />

        <input
          type="text"
          placeholder="Search loaded layers..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") searchLayers();
          }}
          className="w-full bg-transparent py-2 text-sm outline-none"
        />

      </div>

      {/* Right Toolbar */}

      <div className="flex items-center gap-2">

        <button
          type="button"
          title="Manage layers"
          onClick={() => router.push("/layers")}
          className="rounded-lg border p-2 hover:bg-muted"
        >
          <Layers3 className="h-5 w-5" />
        </button>

        <button
          type="button"
          title="Upload dataset"
          onClick={() => router.push("/datasets")}
          className="rounded-lg border p-2 hover:bg-muted"
        >
          <Upload className="h-5 w-5" />
        </button>

        <button
          type="button"
          title="Export selected feature"
          onClick={exportSelectedFeature}
          className="rounded-lg border p-2 hover:bg-muted"
        >
          <Download className="h-5 w-5" />
        </button>

        <button
          type="button"
          title="Reload map data"
          onClick={() => window.location.reload()}
          className="rounded-lg border p-2 hover:bg-muted"
        >
          <RefreshCw className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => router.push("/ai")}
          className="rounded-lg bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700"
        >
          <span className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            AI Analysis
          </span>
        </button>

      </div>

    </header>
  );
}
