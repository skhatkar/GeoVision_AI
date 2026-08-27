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
  Sparkles,
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
  const activeTool = useToolStore((state) => state.activeTool);
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
      id: "select",
      icon: MousePointer2,
      label: "Select",
      action: () => setTool("select"),
    },
    {
      id: "pan",
      icon: Move,
      label: "Pan",
      action: () => setTool("pan"),
    },
    {
      id: "zoom-in",
      icon: ZoomIn,
      label: "Zoom In",
      action: zoomIn,
    },
    {
      id: "zoom-out",
      icon: ZoomOut,
      label: "Zoom Out",
      action: zoomOut,
    },
    {
      id: "home",
      icon: LocateFixed,
      label: "Home / Center HP",
      action: goHome,
    },
    {
      id: "measure-distance",
      icon: Ruler,
      label: "Measure Distance",
      action: () => setTool("measure-distance"),
    },
    {
      id: "draw-marker",
      icon: MapPin,
      label: "Marker",
      action: drawMarker,
    },
    {
      id: "draw-polyline",
      icon: Pencil,
      label: "Polyline",
      action: drawPolyline,
    },
    {
      id: "draw-polygon",
      icon: Pentagon,
      label: "Polygon",
      action: drawPolygon,
    },
    {
      id: "draw-rectangle",
      icon: RectangleHorizontal,
      label: "Rectangle",
      action: drawRectangle,
    },
    {
      id: "draw-circle",
      icon: Circle,
      label: "Circle",
      action: drawCircle,
    },
    {
      id: "edit",
      icon: SquarePen,
      label: "Edit",
      action: editFeatures,
    },
    {
      id: "delete",
      icon: Trash2,
      label: "Delete",
      action: deleteFeatures,
    },
  ];

  return (
    <header className="flex items-center justify-between border-b bg-card/90 backdrop-blur-md px-3.5 py-2.5 z-20 gap-3">
      {/* Left Toolbar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <BasemapSwitcher />

        <div className="h-5 w-px bg-border mx-0.5" />

        <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-xl border border-border/40">
          {tools.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.label}
                title={tool.label}
                onClick={tool.action}
                className={`
                  flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105"
                  }
                `}
              >
                <tool.icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex w-64 lg:w-80 items-center rounded-xl border border-border/60 bg-muted/30 px-3 transition-all focus-within:border-primary/50 focus-within:bg-card focus-within:shadow-xs">
        <Search className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search loaded GIS layers…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") searchLayers();
          }}
          className="w-full bg-transparent py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>

      {/* Right Toolbar Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          title="Manage layers"
          onClick={() => router.push("/layers")}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105 transition-all cursor-pointer"
        >
          <Layers3 className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Upload dataset"
          onClick={() => router.push("/datasets")}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105 transition-all cursor-pointer"
        >
          <Upload className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Export selected feature"
          onClick={exportSelectedFeature}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105 transition-all cursor-pointer"
        >
          <Download className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Reload map data"
          onClick={() => window.location.reload()}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105 transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* AI Spatial Copilot Button with Gradient & Glow */}
        <button
          type="button"
          onClick={() => router.push("/ai")}
          className="
            flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white
            shadow-sm hover:shadow-md hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer
          "
        >
          <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
          <span>AI Spatial Hub</span>
        </button>
      </div>
    </header>
  );
}
