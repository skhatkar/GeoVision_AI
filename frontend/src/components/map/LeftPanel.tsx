"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  ChevronRight,
  Database,
  Layers3,
  Map,
  Search,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import BasemapSwitcher from "./BasemapSwitcher";
import { useLayerStore } from "@/store/layerStore";

const LayerListDynamic = dynamic(
  () => import("@/components/layers/LayerList"),
  {
    ssr: false,
  }
);

export default function LeftPanel() {
  const [search, setSearch] = useState("");
  const layers = useLayerStore((s) => s.layers);

  const [openSections, setOpenSections] = useState({
    BaseMaps: false,
    ProjectsAndLayers: true,
  });

  const toggleSection = (section: "BaseMaps" | "ProjectsAndLayers") => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside className="flex w-84 flex-col border-r bg-card/90 backdrop-blur-md z-20 shadow-sm">
      {/* Header */}
      <div className="border-b bg-muted/20 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers3 size={17} />
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Projects & Layers
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {layers.length} GIS {layers.length === 1 ? "layer" : "layers"} loaded
            </p>
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="border-b p-2.5 bg-muted/10">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter layers by name…"
            className="w-full rounded-xl border border-border/60 bg-muted/40 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-background transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* ================= Projects & GIS Layers ================= */}
        <div className="rounded-xl border bg-background/50 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("ProjectsAndLayers")}
            className="flex w-full items-center justify-between p-2.5 bg-muted/30 hover:bg-muted/60 transition-colors text-left cursor-pointer border-b"
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-semibold text-foreground">
                Active GIS Layers
              </span>
            </div>

            {openSections.ProjectsAndLayers ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>

          {openSections.ProjectsAndLayers && (
            <div className="p-2">
              <LayerListDynamic search={search} />
            </div>
          )}
        </div>

        {/* ================= Base Maps ================= */}
        <div className="rounded-xl border bg-background/50 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("BaseMaps")}
            className="flex w-full items-center justify-between p-2.5 bg-muted/30 hover:bg-muted/60 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-sky-500" />
              <span className="text-xs font-semibold text-foreground">
                Basemap Gallery
              </span>
            </div>

            {openSections.BaseMaps ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>

          {openSections.BaseMaps && (
            <div className="p-2.5 border-t bg-muted/10">
              <BasemapSwitcher />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}