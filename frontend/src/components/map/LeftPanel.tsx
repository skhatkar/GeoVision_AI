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
import { useSpatialFilterStore } from "@/store/spatialFilterStore";
import { useEffect, useMemo } from "react";
import {
  MapPin,
  RotateCcw,
  Building,
  CheckCircle2,
  Filter,
  Download,
} from "lucide-react";
import {
  exportAssetsToCSV,
  exportAssetsToGeoJSON,
  exportAssetsToJSON,
  generateExportFilename,
} from "@/lib/exportUtils";

const LayerListDynamic = dynamic(
  () => import("@/components/layers/LayerList"),
  {
    ssr: false,
  }
);

export default function LeftPanel() {
  const [search, setSearch] = useState("");
  const layers = useLayerStore((s) => s.layers);

  const hierarchy = useSpatialFilterStore((s) => s.hierarchy);
  const loadHierarchy = useSpatialFilterStore((s) => s.loadHierarchy);
  const loadingHierarchy = useSpatialFilterStore((s) => s.loadingHierarchy);
  const loadingAssets = useSpatialFilterStore((s) => s.loadingAssets);
  const hierarchyError = useSpatialFilterStore((s) => s.error);

  const selectedDistrict = useSpatialFilterStore((s) => s.selectedDistrict);
  const selectedBlock = useSpatialFilterStore((s) => s.selectedBlock);
  const selectedPanchayat = useSpatialFilterStore((s) => s.selectedPanchayat);
  const selectedDepartment = useSpatialFilterStore((s) => s.selectedDepartment);
  const filteredAssets = useSpatialFilterStore((s) => s.filteredAssets);

  const setDistrict = useSpatialFilterStore((s) => s.setDistrict);
  const setBlock = useSpatialFilterStore((s) => s.setBlock);
  const setPanchayat = useSpatialFilterStore((s) => s.setPanchayat);
  const resetFilter = useSpatialFilterStore((s) => s.resetFilter);
  const getAvailableBlocks = useSpatialFilterStore((s) => s.getAvailableBlocks);
  const getAvailablePanchayats = useSpatialFilterStore((s) => s.getAvailablePanchayats);
  const getDepartmentCounts = useSpatialFilterStore((s) => s.getDepartmentCounts);

  useEffect(() => {
    void loadHierarchy();
  }, [loadHierarchy]);

  const availableBlocks = useMemo(() => {
    return getAvailableBlocks();
  }, [selectedDistrict, hierarchy, getAvailableBlocks]);

  const availablePanchayats = useMemo(() => {
    return getAvailablePanchayats();
  }, [selectedBlock, availableBlocks, getAvailablePanchayats]);

  const departmentCounts = useMemo(() => {
    return getDepartmentCounts();
  }, [filteredAssets, getDepartmentCounts]);

  const isFilterActive = Boolean(
    selectedDistrict || selectedBlock || selectedPanchayat
  );

  const [openSections, setOpenSections] = useState({
    AdminFilter: true,
    BaseMaps: false,
    ProjectsAndLayers: true,
  });

  const toggleSection = (section: "AdminFilter" | "BaseMaps" | "ProjectsAndLayers") => {
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
        {/* ================= Administrative Filter (District > Block > Panchayat) ================= */}
        <div className="rounded-xl border bg-background/50 overflow-hidden shadow-xs">
          <div className="border-b bg-muted/30 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground leading-tight">
                  Administrative Filter
                </p>
                <p className="text-[10px] text-muted-foreground">
                  District &gt; Block &gt; Panchayat
                </p>
              </div>
            </div>

            {isFilterActive && (
              <button
                onClick={() => resetFilter()}
                title="Reset all filters"
                className="flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive hover:bg-destructive/20 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="p-2.5 space-y-2 text-xs">
            {/* 1. District Selector */}
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                District:
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={loadingHierarchy || !hierarchy}
                className="w-full rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/70 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All Districts ({hierarchy?.total_districts ?? 0})</option>
                {hierarchy?.districts.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.total_assets} assets)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Block Selector */}
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Block / Tehsil:
              </label>
              <select
                value={selectedBlock}
                onChange={(e) => setBlock(e.target.value)}
                disabled={!selectedDistrict || availableBlocks.length === 0}
                className="w-full rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/70 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {!selectedDistrict
                    ? "Select a District first"
                    : `All Blocks (${availableBlocks.length})`}
                </option>
                {availableBlocks.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} ({b.total_assets} assets)
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Panchayat Selector */}
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Gram Panchayat:
              </label>
              <select
                value={selectedPanchayat}
                onChange={(e) => setPanchayat(e.target.value)}
                disabled={!selectedBlock || availablePanchayats.length === 0}
                className="w-full rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/70 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {!selectedBlock
                    ? "Select a Block first"
                    : `All Panchayats (${availablePanchayats.length})`}
                </option>
                {availablePanchayats.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.total_assets} assets)
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Status Badge */}
            {isFilterActive && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Matching Assets:
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {loadingAssets ? "Loading..." : `${filteredAssets.length} found`}
                  </span>
                </div>

                {/* Micro Department count pills */}
                {Object.keys(departmentCounts).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(departmentCounts).map(([dept, count]) => (
                      <span
                        key={dept}
                        className="rounded-md bg-muted/80 px-1.5 py-0.5 text-[9px] font-medium text-foreground truncate max-w-[130px]"
                        title={`${dept}: ${count}`}
                      >
                        {dept}: <strong>{count}</strong>
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-1.5 text-[10px] text-muted-foreground leading-tight">
                  Applied to all active GIS layers with matching attributes.
                </p>

                {/* Export Toolbar */}
                {filteredAssets.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Download size={11} className="text-primary" /> Export Data:
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const fname = generateExportFilename(selectedDistrict, selectedBlock, selectedPanchayat, selectedDepartment, "csv");
                          exportAssetsToCSV(filteredAssets, fname);
                        }}
                        className="rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 text-[9px] font-bold transition-colors cursor-pointer border border-emerald-500/20"
                        title="Export all matching assets to CSV"
                      >
                        CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const fname = generateExportFilename(selectedDistrict, selectedBlock, selectedPanchayat, selectedDepartment, "geojson");
                          exportAssetsToGeoJSON(filteredAssets, fname);
                        }}
                        className="rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 text-[9px] font-bold transition-colors cursor-pointer border border-sky-500/20"
                        title="Export all matching assets to GeoJSON"
                      >
                        GeoJSON
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const fname = generateExportFilename(selectedDistrict, selectedBlock, selectedPanchayat, selectedDepartment, "json");
                          exportAssetsToJSON(filteredAssets, fname);
                        }}
                        className="rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 text-[9px] font-bold transition-colors cursor-pointer border border-amber-500/20"
                        title="Export all matching assets to JSON"
                      >
                        JSON
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {hierarchyError && (
              <p className="mt-1 text-[10px] text-destructive">{hierarchyError}</p>
            )}
          </div>
        </div>


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
