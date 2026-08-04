"use client";

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

export default function TopToolbar() {
  const tools = [
    {
      icon: MousePointer2,
      label: "Select",
      action: () => console.log("Select"),
    },

    {
      icon: Move,
      label: "Pan",
      action: () => console.log("Pan"),
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
      action: () => console.log("Measure"),
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
          placeholder="Search village, asset, layer..."
          className="w-full bg-transparent py-2 text-sm outline-none"
        />

      </div>

      {/* Right Toolbar */}

      <div className="flex items-center gap-2">

        <button className="rounded-lg border p-2 hover:bg-muted">
          <Layers3 className="h-5 w-5" />
        </button>

        <button className="rounded-lg border p-2 hover:bg-muted">
          <Upload className="h-5 w-5" />
        </button>

        <button className="rounded-lg border p-2 hover:bg-muted">
          <Download className="h-5 w-5" />
        </button>

        <button className="rounded-lg border p-2 hover:bg-muted">
          <RefreshCw className="h-5 w-5" />
        </button>

        <button className="rounded-lg bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700">
          <span className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            AI Analysis
          </span>
        </button>

      </div>

    </header>
  );
}