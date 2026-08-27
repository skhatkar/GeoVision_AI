"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getLayers, type BackendLayer } from "@/api/layerApi";
import { useLayerStore } from "@/store/layerStore";
import type { GISLayer } from "@/types/layer";
import { getProjects, type Project } from "@/api/projectApi";
import LayerStyleDialog from "@/components/layers/LayerStyleDialog";
import LayerIconBadge from "@/components/layers/LayerIconBadge";
import {
  Layers,
  Search,
  Map as MapIcon,
  MapPin,
  TrendingUp,
  Square,
  SlidersHorizontal,
  Info,
  Database,
  Calendar,
  Hash,
  Palette,
  Folder,
  FolderOpen,
  Filter,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

type GeomType = "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon" | string;

function geomBadge(type: GeomType) {
  const t = (type ?? "").toLowerCase();
  if (t.includes("point")) return "bg-sky-500/15 text-sky-400";
  if (t.includes("line")) return "bg-yellow-500/15 text-yellow-400";
  if (t.includes("polygon")) return "bg-rose-500/15 text-rose-400";
  return "bg-muted text-muted-foreground";
}

// ─────────────────────────────────────────────────────────────
// Layer detail sheet
// ─────────────────────────────────────────────────────────────
interface LayerDetailSheetProps {
  layer: BackendLayer | null;
  onClose: () => void;
  onOpenInMap: (layer: BackendLayer) => void;
  onStyle: (layer: BackendLayer) => void;
}

function LayerDetailSheet({ layer, onClose, onOpenInMap, onStyle }: LayerDetailSheetProps) {
  if (!layer) return null;

  const storeLayer = useLayerStore
    .getState()
    .layers.find((l) => l.id === String(layer.id));

  return (
    <Sheet open={!!layer} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto z-[9999]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <LayerIconBadge
              geometryType={layer.geometry_type}
              icon={storeLayer?.icon}
              customIcon={storeLayer?.customIcon}
              color={storeLayer?.color}
              size="md"
            />
            <span className="truncate">{layer.name}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            {[
              { icon: Folder, label: "Project", value: layer.project_name || "General / Base Layer" },
              { icon: Hash, label: "Layer ID", value: `#${layer.id}` },
              { icon: Layers, label: "Geometry Type", value: layer.geometry_type },
              { icon: Database, label: "Feature Count", value: layer.feature_count?.toLocaleString("en-IN") ?? "—" },
              { icon: SlidersHorizontal, label: "CRS", value: layer.crs ?? "—" },
              { icon: Info, label: "Dataset ID", value: `#${layer.dataset_id}` },
              { icon: Calendar, label: "Created", value: fmtDate(layer.created_at) },
              { icon: Calendar, label: "Updated", value: fmtDate(layer.updated_at) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Icon size={13} />
                  {label}
                </span>
                <span className="font-medium font-mono text-xs">{value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Badge className={`text-sm px-3 py-1 ${geomBadge(layer.geometry_type)}`}>
              <span>{layer.geometry_type}</span>
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => { onStyle(layer); onClose(); }}
            >
              <Palette size={16} />
              Style & Icon
            </Button>
            <Button
              className="gap-2"
              onClick={() => { onOpenInMap(layer); onClose(); }}
            >
              <MapIcon size={16} />
              Open in Map
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function LayersPage() {
  const router = useRouter();
  const [layers, setLayers] = useState<BackendLayer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGeom, setFilterGeom] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [selectedLayer, setSelectedLayer] = useState<BackendLayer | null>(null);

  const [styleLayer, setStyleLayer] = useState<GISLayer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [layerData, projectData] = await Promise.all([
        getLayers(),
        getProjects().catch(() => []),
      ]);
      setLayers(layerData);
      setProjects(projectData);
    } catch {
      setLayers([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleOpenInMap(layer: BackendLayer) {
    router.push(`/map?layer=${layer.id}`);
  }

  function handleStyleLayer(backendLayer: BackendLayer) {
    // Find in layerStore or create placeholder
    const existing = useLayerStore.getState().layers.find((l) => l.id === String(backendLayer.id));
    const target: GISLayer = existing || {
      id: String(backendLayer.id),
      name: backendLayer.name,
      type: "geojson",
      url: `/geojson/layer/${backendLayer.id}`,
      visible: true,
      opacity: 1,
      color: "#2563EB",
      weight: 2,
      geometryType: backendLayer.geometry_type,
      featureCount: backendLayer.feature_count,
      crs: backendLayer.crs,
      datasetId: backendLayer.dataset_id,
      projectId: backendLayer.project_id,
      projectName: backendLayer.project_name,
    };
    if (!existing) {
      useLayerStore.getState().addLayer(target);
    }
    setStyleLayer(target);
  }

  const geomTypes = [...new Set(layers.map((l) => l.geometry_type).filter(Boolean))];

  // Distinct projects
  const distinctProjects = useMemo<{ id: string; name: string }[]>(() => {
    const map = new Map<string, string>();
    layers.forEach((l) => {
      const pId = l.project_id ? String(l.project_id) : "general";
      const pName = l.project_name || (pId === "general" ? "General / Base Layers" : `Project #${pId}`);
      map.set(pId, pName);
    });
    const list: { id: string; name: string }[] = [];
    map.forEach((name, id) => {
      list.push({ id, name });
    });
    return list;
  }, [layers]);

  const filtered = layers.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
    const matchGeom = filterGeom === "all" || l.geometry_type === filterGeom;
    const pId = l.project_id ? String(l.project_id) : "general";
    const matchProject = filterProject === "all" || pId === filterProject;
    return matchSearch && matchGeom && matchProject;
  });

  const pointCount = layers.filter((l) => l.geometry_type?.toLowerCase().includes("point")).length;
  const lineCount = layers.filter((l) => l.geometry_type?.toLowerCase().includes("line")).length;
  const polygonCount = layers.filter((l) => l.geometry_type?.toLowerCase().includes("polygon")).length;
  const totalFeatures = layers.reduce((s, l) => s + (l.feature_count ?? 0), 0);

  return (
    <AppShell>
      <PageHeader
        title="Layers"
        subtitle="Browse, filter by project, and manage all registered GIS layers"
      />

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Layers", value: layers.length, color: "text-violet-400" },
          { label: "Point Layers", value: pointCount, color: "text-sky-400", icon: <MapPin size={14} className="text-sky-400" /> },
          { label: "Line Layers", value: lineCount, color: "text-yellow-400", icon: <TrendingUp size={14} className="text-yellow-400" /> },
          { label: "Polygon Layers", value: polygonCount, color: "text-rose-400", icon: <Square size={14} className="text-rose-400" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {s.icon}
              {s.label}
            </p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search layers…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter by Project */}
        <Select value={filterProject} onValueChange={(v) => setFilterProject(v ?? "all")}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {distinctProjects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter by Geometry */}
        <Select value={filterGeom} onValueChange={(v) => setFilterGeom(v ?? "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Geometry type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All geometry types</SelectItem>
            {geomTypes.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Layer cards */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border bg-card" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Layers size={36} className="text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-semibold">
            {search ? "No matching layers" : "No layers yet"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            {search ? `No layers found for "${search}".` : "Upload a dataset to automatically create layers."}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((layer) => {
            const storeLayer = useLayerStore
              .getState()
              .layers.find((l) => l.id === String(layer.id));

            return (
              <div
                key={layer.id}
                className="group hover-lift rounded-2xl border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <LayerIconBadge
                      geometryType={layer.geometry_type}
                      icon={storeLayer?.icon}
                      customIcon={storeLayer?.customIcon}
                      color={storeLayer?.color}
                      size="lg"
                      onClick={() => handleStyleLayer(layer)}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleStyleLayer(layer)}
                        title="Click to customize style"
                      >
                        {layer.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <Badge className={`text-xs ${geomBadge(layer.geometry_type)}`}>
                          {layer.geometry_type}
                        </Badge>
                        {layer.project_name && (
                          <Badge variant="outline" className="text-[11px] gap-1 font-normal bg-muted/40 text-foreground">
                            <Folder size={11} className="text-amber-500" />
                            <span className="truncate max-w-[130px]">{layer.project_name}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedLayer(layer)}
                    title="View details"
                  >
                    <Info size={14} />
                  </Button>
                </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Features", value: layer.feature_count?.toLocaleString("en-IN") ?? "—" },
                  { label: "CRS", value: layer.crs ?? "—", mono: true },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="rounded-lg bg-muted/40 p-2.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`mt-0.5 text-sm font-medium truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground truncate">{fmtDate(layer.created_at)}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-xs px-2 text-primary hover:bg-primary/10"
                    onClick={() => handleStyleLayer(layer)}
                    title="Customize color & marker symbol"
                  >
                    <Palette size={13} />
                    Style
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => handleOpenInMap(layer)}
                  >
                    <MapIcon size={12} />
                    Open in Map
                  </Button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Total features footer */}
      {!loading && layers.length > 0 && (
        <div className="mt-6 rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground text-center">
          Showing {filtered.length} of {layers.length} layers ·{" "}
          <strong>{totalFeatures.toLocaleString("en-IN")}</strong> total features
        </div>
      )}

      <LayerDetailSheet
        layer={selectedLayer}
        onClose={() => setSelectedLayer(null)}
        onOpenInMap={handleOpenInMap}
        onStyle={handleStyleLayer}
      />

      <LayerStyleDialog
        open={!!styleLayer}
        onClose={() => setStyleLayer(null)}
        layer={styleLayer}
      />
    </AppShell>
  );
}
