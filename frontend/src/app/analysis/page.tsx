"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Workflow,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  GitMerge,
  Maximize2,
  Scissors,
  Circle,
  Minus,
  Square,
  BarChart2,
  Users,
  Layers,
  Download,
  Loader2,
  MapPin,
  Sparkles,
  Compass,
  Table as TableIcon,
  Code2,
  Copy,
  ExternalLink,
} from "lucide-react";
import * as analysisApi from "@/api/analysisApi";
import { getLayers, type BackendLayer } from "@/api/layerApi";

// ─────────────────────────────────────────────────────────────
// Tool definitions
// ─────────────────────────────────────────────────────────────
type ParamType = "layer" | "asset" | "number" | "text" | "coords";

interface ToolParam {
  key: string;
  label: string;
  type: ParamType;
  placeholder?: string;
  default?: string | number;
  geometryFilter?: "Polygon" | "Point" | "Line";
}

interface Tool {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  params: ToolParam[];
  run: (params: Record<string, string>) => Promise<unknown>;
}

const TOOLS: Tool[] = [
  // ─── Spatial Relations ───
  {
    id: "within",
    label: "Within",
    description: "Find features from target layer that fall completely inside container boundaries (e.g. Police within Districts).",
    icon: <Square size={16} />,
    category: "Spatial Relations",
    params: [
      { key: "container_layer_id", label: "Container Boundary Layer (Polygons)", type: "layer", geometryFilter: "Polygon" },
      { key: "target_layer_id", label: "Target Asset Layer (Points/Lines)", type: "layer" },
    ],
    run: (p) => analysisApi.runWithin(Number(p.container_layer_id), Number(p.target_layer_id)),
  },
  {
    id: "contains",
    label: "Contains",
    description: "Find boundary polygons that contain specific target infrastructure assets.",
    icon: <Square size={16} />,
    category: "Spatial Relations",
    params: [
      { key: "container_layer_id", label: "Container Boundary Layer", type: "layer", geometryFilter: "Polygon" },
      { key: "target_layer_id", label: "Target Asset Layer", type: "layer" },
    ],
    run: (p) => analysisApi.runContains(Number(p.container_layer_id), Number(p.target_layer_id)),
  },
  {
    id: "intersect",
    label: "Intersect",
    description: "Find features that spatially intersect or overlap between two layers.",
    icon: <GitMerge size={16} />,
    category: "Spatial Relations",
    params: [
      { key: "layer1_id", label: "First Layer", type: "layer" },
      { key: "layer2_id", label: "Second Layer", type: "layer" },
    ],
    run: (p) => analysisApi.runIntersect(Number(p.layer1_id), Number(p.layer2_id)),
  },
  {
    id: "nearest",
    label: "Nearest Neighbor",
    description: "Find the closest GIS assets to a specific GPS coordinate with exact geodesic distances.",
    icon: <Compass size={16} />,
    category: "Spatial Relations",
    params: [
      { key: "lat", label: "Latitude", type: "number", placeholder: "31.1048", default: 31.1048 },
      { key: "lng", label: "Longitude", type: "number", placeholder: "77.1734", default: 77.1734 },
      { key: "limit", label: "Result Limit", type: "number", placeholder: "10", default: 10 },
    ],
    run: (p) => analysisApi.runNearest(Number(p.lat), Number(p.lng), Number(p.limit || 10)),
  },
  {
    id: "buffer",
    label: "Asset Buffer Zone",
    description: "Generate a radial buffer zone around a specific asset to identify neighboring features.",
    icon: <Circle size={16} />,
    category: "Spatial Relations",
    params: [
      { key: "asset_id", label: "Target Asset ID", type: "number", placeholder: "e.g. 1981 (Shimla District)", default: 1981 },
      { key: "distance", label: "Buffer Distance (meters)", type: "number", placeholder: "1000", default: 1000 },
    ],
    run: (p) => analysisApi.runBuffer(Number(p.asset_id), Number(p.distance)),
  },

  // ─── Geometry & Measurements ───
  {
    id: "area",
    label: "Layer Total Area",
    description: "Calculate the exact surface area of polygon features in square meters and square kilometers (m² & km²).",
    icon: <Square size={16} />,
    category: "Geometry",
    params: [
      { key: "layer_id", label: "Polygon Layer", type: "layer", geometryFilter: "Polygon" },
    ],
    run: (p) => analysisApi.runArea(Number(p.layer_id)),
  },
  {
    id: "length",
    label: "Layer Total Length",
    description: "Calculate the cumulative linear length of road, river, or line features (meters & km).",
    icon: <Minus size={16} />,
    category: "Geometry",
    params: [
      { key: "layer_id", label: "Line Layer", type: "layer" },
    ],
    run: (p) => analysisApi.runLength(Number(p.layer_id)),
  },
  {
    id: "centroid",
    label: "Layer Centroids",
    description: "Compute the geometric center points (centroids) for every feature in a layer.",
    icon: <Circle size={16} />,
    category: "Geometry",
    params: [
      { key: "layer_id", label: "Target Layer", type: "layer" },
    ],
    run: (p) => analysisApi.runCentroid(Number(p.layer_id)),
  },
  {
    id: "convex_hull",
    label: "Convex Hull Envelope",
    description: "Compute the minimum convex boundary polygon enclosing all assets in a layer.",
    icon: <Maximize2 size={16} />,
    category: "Geometry",
    params: [
      { key: "layer_id", label: "Target Layer", type: "layer" },
    ],
    run: (p) => analysisApi.runConvexHull(Number(p.layer_id)),
  },
  {
    id: "bbox",
    label: "Bounding Box (Envelope)",
    description: "Calculate the axis-aligned spatial bounding extent (North, South, East, West).",
    icon: <Square size={16} />,
    category: "Geometry",
    params: [
      { key: "layer_id", label: "Target Layer", type: "layer" },
    ],
    run: (p) => analysisApi.runBbox(Number(p.layer_id)),
  },

  // ─── Advanced GIS & Overlay ───
  {
    id: "clip",
    label: "Clip Layer",
    description: "Overlay and cookie-cutter cut an input layer using a boundary polygon layer.",
    icon: <Scissors size={16} />,
    category: "Advanced GIS",
    params: [
      { key: "input_layer_id", label: "Input Layer to Clip", type: "layer" },
      { key: "clip_layer_id", label: "Clipping Boundary Layer", type: "layer", geometryFilter: "Polygon" },
    ],
    run: (p) => analysisApi.runClip(Number(p.input_layer_id), Number(p.clip_layer_id)),
  },
  {
    id: "union",
    label: "Union Merge",
    description: "Dissolve and merge all geometries in a layer into a single unified geometry.",
    icon: <GitMerge size={16} />,
    category: "Advanced GIS",
    params: [
      { key: "layer_id", label: "Target Layer", type: "layer" },
    ],
    run: (p) => analysisApi.runUnion(Number(p.layer_id)),
  },
  {
    id: "difference",
    label: "Spatial Difference",
    description: "Subtract Layer 2 geometry from Layer 1, preserving non-overlapping regions.",
    icon: <Minus size={16} />,
    category: "Advanced GIS",
    params: [
      { key: "layer1_id", label: "Base Layer", type: "layer" },
      { key: "layer2_id", label: "Subtracting Layer", type: "layer" },
    ],
    run: (p) => analysisApi.runDifference(Number(p.layer1_id), Number(p.layer2_id)),
  },
  {
    id: "multi_buffer",
    label: "Concentric Multi-Buffer",
    description: "Generate radial buffer zones for all features across an entire layer.",
    icon: <Circle size={16} />,
    category: "Advanced GIS",
    params: [
      { key: "layer_id", label: "Target Layer", type: "layer" },
      { key: "distance", label: "Buffer Distance (m)", type: "number", placeholder: "500", default: 500 },
    ],
    run: (p) => analysisApi.runMultiBuffer(Number(p.layer_id), Number(p.distance)),
  },

  // ─── Spatial ML & Statistics ───
  {
    id: "kmeans",
    label: "K-Means Spatial Clustering",
    description: "Partition assets into k optimal spatial clusters using PostGIS K-Means algorithm.",
    icon: <Users size={16} />,
    category: "ML / Stats",
    params: [
      { key: "layer_id", label: "Point Layer", type: "layer" },
      { key: "clusters", label: "Cluster Count (k)", type: "number", placeholder: "5", default: 5 },
    ],
    run: (p) => analysisApi.runKmeans(Number(p.layer_id), Number(p.clusters || 5)),
  },
  {
    id: "density",
    label: "Spatial Density & Extent",
    description: "Compute the spatial extent and asset concentration density.",
    icon: <BarChart2 size={16} />,
    category: "ML / Stats",
    params: [
      { key: "layer_id", label: "Target Layer", type: "layer" },
    ],
    run: (p) => analysisApi.runDensity(Number(p.layer_id)),
  },
];

const CATEGORIES = ["Spatial Relations", "Geometry", "Advanced GIS", "ML / Stats"];

const CATEGORY_COLORS: Record<string, string> = {
  "Spatial Relations": "text-sky-500",
  "Geometry": "text-emerald-500",
  "Advanced GIS": "text-violet-500",
  "ML / Stats": "text-amber-500",
};

interface HistoryItem {
  id: string;
  toolLabel: string;
  params: Record<string, string>;
  status: "success" | "error";
  result?: unknown;
  error?: string;
  timestamp: Date;
}

export default function AnalysisPage() {
  const [layers, setLayers] = useState<BackendLayer[]>([]);
  const [loadingLayers, setLoadingLayers] = useState(true);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [params, setParams] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTool, setSearchTool] = useState("");
  const [resultTab, setResultTab] = useState<"summary" | "table" | "json">("summary");
  const [copied, setCopied] = useState(false);

  // Fetch all active database layers
  useEffect(() => {
    async function loadLayers() {
      setLoadingLayers(true);
      try {
        const list = await getLayers();
        if (Array.isArray(list)) {
          setLayers(list);
        }
      } catch (err) {
        console.warn("Failed to load layers for spatial analysis:", err);
      } finally {
        setLoadingLayers(false);
      }
    }
    loadLayers();
  }, []);

  // Pre-fill tool parameters with valid layers
  const selectTool = useCallback((tool: Tool) => {
    setSelectedTool(tool);
    setResult(null);
    setRunError(null);
    setResultTab("summary");

    const initialParams: Record<string, string> = {};
    tool.params.forEach((p) => {
      if (p.default !== undefined) {
        initialParams[p.key] = String(p.default);
      } else if (p.type === "layer" && layers.length > 0) {
        // If there is a geometry filter, try to find a matching layer
        if (p.geometryFilter) {
          const match = layers.find((l) =>
            l.geometry_type?.toLowerCase().includes(p.geometryFilter!.toLowerCase())
          );
          if (match) {
            initialParams[p.key] = String(match.id);
            return;
          }
        }
        // Default to first/second layer
        if (p.key.includes("2") || p.key.includes("target")) {
          initialParams[p.key] = String(layers[1]?.id ?? layers[0]?.id);
        } else {
          initialParams[p.key] = String(layers[0]?.id);
        }
      }
    });

    setParams(initialParams);
  }, [layers]);

  // Select default tool on initial load
  useEffect(() => {
    if (!selectedTool && TOOLS.length > 0 && layers.length > 0) {
      selectTool(TOOLS[0]);
    }
  }, [layers, selectedTool, selectTool]);

  const runAnalysis = async () => {
    if (!selectedTool) return;
    setRunning(true);
    setResult(null);
    setRunError(null);

    try {
      const res = await selectedTool.run(params);
      setResult(res);
      setHistory((prev) => [
        {
          id: Math.random().toString(36).slice(2),
          toolLabel: selectedTool.label,
          params,
          status: "success",
          result: res,
          timestamp: new Date(),
        },
        ...prev.slice(0, 8),
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Spatial analysis failed";
      setRunError(msg);
      setHistory((prev) => [
        {
          id: Math.random().toString(36).slice(2),
          toolLabel: selectedTool.label,
          params,
          status: "error",
          error: msg,
          timestamp: new Date(),
        },
        ...prev.slice(0, 8),
      ]);
    } finally {
      setRunning(false);
    }
  };

  const copyJSON = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTool?.id}_analysis_result.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredTools = TOOLS.filter(
    (t) =>
      t.label.toLowerCase().includes(searchTool.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTool.toLowerCase())
  );

  // Extract table records from various result shapes
  const tableData: any[] = Array.isArray(result)
    ? result
    : result?.results || result?.assets || result?.centroids || result?.features || [];

  return (
    <AppShell>
      <PageHeader
        title="Spatial Analysis Engine"
        subtitle="Execute high-performance PostGIS and Turf.js spatial operations, buffering, containment, and clustering"
      />

      <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-230px)]">
        {/* ── Left panel: Tool list ── */}
        <div className="w-full lg:w-76 shrink-0 flex flex-col space-y-3">
          <div className="relative">
            <Workflow className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search spatial tools…"
              className="pl-9 text-xs bg-card/80 border-border/70"
              value={searchTool}
              onChange={(e) => setSearchTool(e.target.value)}
            />
          </div>

          <ScrollArea className="flex-1 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md max-h-[600px] shadow-sm">
            <div className="p-3 space-y-5">
              {CATEGORIES.map((cat) => {
                const catTools = filteredTools.filter((t) => t.category === cat);
                if (catTools.length === 0) return null;
                return (
                  <div key={cat} className="space-y-1">
                    <p className={`px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[cat]}`}>
                      {cat}
                    </p>
                    <div className="space-y-1">
                      {catTools.map((tool) => {
                        const active = selectedTool?.id === tool.id;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => selectTool(tool)}
                            className={`
                              w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-all cursor-pointer
                              ${
                                active
                                  ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/25 translate-x-1"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-0.5"
                              }
                            `}
                          >
                            <span className="flex items-center gap-2.5 min-w-0">
                              <span className={active ? "text-primary-foreground" : CATEGORY_COLORS[tool.category]}>
                                {tool.icon}
                              </span>
                              <span className="truncate">{tool.label}</span>
                            </span>
                            <ChevronRight size={13} className={active ? "opacity-100" : "opacity-0"} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* ── Middle panel: Parameters + Interactive Result ── */}
        <div className="flex flex-1 flex-col gap-4 min-w-0">
          {!selectedTool ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed bg-card p-12 text-center">
              <Workflow size={40} className="text-muted-foreground/30 mb-3" />
              <h3 className="text-base font-semibold text-foreground">Select a Spatial Tool</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Choose an operation from the left panel to configure and run on your GIS layers.
              </p>
            </div>
          ) : (
            <>
              {/* Tool Header Card */}
              <div className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-md p-4 shadow-sm space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      {selectedTool.icon}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <span>{selectedTool.label}</span>
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {selectedTool.description}
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className={`text-[10px] uppercase font-bold shrink-0 ${CATEGORY_COLORS[selectedTool.category]}`}>
                    {selectedTool.category}
                  </Badge>
                </div>
              </div>

              {/* Parameter Form Card */}
              <div className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-md p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles size={13} className="text-primary" />
                  <span>Configure Parameters</span>
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedTool.params.map((param) => (
                    <div key={param.key} className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        {param.label}
                      </label>

                      {param.type === "layer" ? (
                        <select
                          value={params[param.key] ?? ""}
                          onChange={(e) =>
                            setParams((prev) => ({ ...prev, [param.key]: e.target.value }))
                          }
                          className="w-full rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:bg-background transition-all cursor-pointer"
                        >
                          <option value="">Select GIS Layer…</option>
                          {layers.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name} ({l.feature_count} features · {l.geometry_type})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          type={param.type === "number" ? "number" : "text"}
                          placeholder={param.placeholder}
                          value={params[param.key] ?? ""}
                          onChange={(e) =>
                            setParams((prev) => ({ ...prev, [param.key]: e.target.value }))
                          }
                          className="text-xs bg-muted/40 border-border/70 h-9"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Presets for Nearest Neighbor */}
                {selectedTool.id === "nearest" && (
                  <div className="pt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-muted-foreground font-medium">Quick Coordinates:</span>
                    <button
                      type="button"
                      onClick={() => setParams((p) => ({ ...p, lat: "31.1048", lng: "77.1734" }))}
                      className="rounded-lg bg-muted/60 hover:bg-muted px-2 py-0.5 text-[10px] font-mono text-foreground border border-border/50 cursor-pointer"
                    >
                      📍 Shimla (31.10, 77.17)
                    </button>
                    <button
                      type="button"
                      onClick={() => setParams((p) => ({ ...p, lat: "32.2190", lng: "76.3234" }))}
                      className="rounded-lg bg-muted/60 hover:bg-muted px-2 py-0.5 text-[10px] font-mono text-foreground border border-border/50 cursor-pointer"
                    >
                      📍 Dharamshala (32.21, 76.32)
                    </button>
                    <button
                      type="button"
                      onClick={() => setParams((p) => ({ ...p, lat: "31.9579", lng: "77.1095" }))}
                      className="rounded-lg bg-muted/60 hover:bg-muted px-2 py-0.5 text-[10px] font-mono text-foreground border border-border/50 cursor-pointer"
                    >
                      📍 Kullu (31.95, 77.10)
                    </button>
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-2 flex items-center gap-3 flex-wrap">
                  <Button
                    onClick={runAnalysis}
                    disabled={running}
                    className="gap-2 text-xs font-semibold cursor-pointer shadow-md shadow-primary/20"
                  >
                    {running ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Executing PostGIS Query…</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} />
                        <span>Execute Spatial Analysis</span>
                      </>
                    )}
                  </Button>

                  {result && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadJSON}
                        className="gap-1.5 text-xs cursor-pointer border-border/70"
                      >
                        <Download size={13} />
                        <span>Download JSON</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyJSON}
                        className="gap-1.5 text-xs cursor-pointer border-border/70"
                      >
                        {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        <span>{copied ? "Copied" : "Copy Output"}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Banner */}
              {runError && (
                <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
                  <XCircle size={17} className="text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-xs text-destructive">Execution Error</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{runError}</p>
                  </div>
                </div>
              )}

              {/* Interactive Multi-Tab Result Viewer */}
              {result && (
                <div className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-md p-4 shadow-sm space-y-3">
                  {/* Results Header */}
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                        Spatial Query Output
                      </span>
                    </div>

                    {/* Result View Tabs */}
                    <div className="flex rounded-xl border bg-muted/40 p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setResultTab("summary")}
                        className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          resultTab === "summary"
                            ? "bg-card text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Summary
                      </button>
                      <button
                        type="button"
                        onClick={() => setResultTab("table")}
                        className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          resultTab === "table"
                            ? "bg-card text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Data Table ({tableData.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setResultTab("json")}
                        className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          resultTab === "json"
                            ? "bg-card text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        GeoJSON / Code
                      </button>
                    </div>
                  </div>

                  {/* Tab 1: Executive KPI Summary */}
                  {resultTab === "summary" && (
                    <div className="grid gap-3 sm:grid-cols-3 py-1">
                      {result.area_sq_km !== undefined && (
                        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Calculated Area</p>
                          <p className="text-xl font-bold font-mono text-emerald-500">
                            {result.area_sq_km?.toLocaleString("en-IN", { maximumFractionDigits: 2 })} km²
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {result.area_sq_meter?.toLocaleString("en-IN")} sq meters
                          </p>
                        </div>
                      )}

                      {result.length_km !== undefined && (
                        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Calculated Length</p>
                          <p className="text-xl font-bold font-mono text-sky-500">
                            {result.length_km?.toLocaleString("en-IN", { maximumFractionDigits: 2 })} km
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {result.length_meter?.toLocaleString("en-IN")} meters
                          </p>
                        </div>
                      )}

                      {result.feature_count !== undefined && (
                        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Processed Features</p>
                          <p className="text-xl font-bold font-mono text-foreground">
                            {result.feature_count}
                          </p>
                        </div>
                      )}

                      {result.count !== undefined && (
                        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Matched Spatial Pairs</p>
                          <p className="text-xl font-bold font-mono text-foreground">
                            {result.count}
                          </p>
                        </div>
                      )}

                      {Array.isArray(result) && (
                        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Results Retrieved</p>
                          <p className="text-xl font-bold font-mono text-foreground">
                            {result.length}
                          </p>
                        </div>
                      )}

                      <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Engine Status</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span>Spatial Query Complete</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Interactive Data Table */}
                  {resultTab === "table" && (
                    <div className="max-h-72 overflow-auto rounded-xl border bg-muted/20">
                      {tableData.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-8">
                          No tabular records in this analysis output.
                        </p>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-muted/60 text-muted-foreground uppercase font-bold text-[10px] sticky top-0">
                            <tr>
                              <th className="p-2.5">#</th>
                              {Object.keys(tableData[0] || {})
                                .slice(0, 4)
                                .map((k) => (
                                  <th key={k} className="p-2.5">
                                    {k}
                                  </th>
                                ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {tableData.slice(0, 50).map((row, idx) => (
                              <tr key={idx} className="hover:bg-muted/40 transition-colors font-mono text-[11px]">
                                <td className="p-2.5 text-muted-foreground">{idx + 1}</td>
                                {Object.keys(tableData[0] || {})
                                  .slice(0, 4)
                                  .map((k) => (
                                    <td key={k} className="p-2.5 max-w-[200px] truncate text-foreground">
                                      {typeof row[k] === "object" ? JSON.stringify(row[k]) : String(row[k] ?? "—")}
                                    </td>
                                  ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* Tab 3: JSON Code */}
                  {resultTab === "json" && (
                    <ScrollArea className="h-64 rounded-xl border bg-muted/30 p-3">
                      <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </ScrollArea>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right panel: History ── */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock size={13} />
            <span>Recent Runs</span>
          </p>

          <ScrollArea className="flex-1 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md p-3 max-h-[600px] shadow-sm">
            {history.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Clock size={24} className="mb-2 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">No recent analysis runs</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className={`rounded-xl border p-2.5 text-xs space-y-1 ${
                      h.status === "success"
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-destructive/20 bg-destructive/5"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold">
                      {h.status === "success" ? (
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      ) : (
                        <XCircle size={12} className="text-destructive" />
                      )}
                      <span className="truncate">{h.toolLabel}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {h.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </AppShell>
  );
}
