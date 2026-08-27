"use client";

import { useState, useEffect, useCallback } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLayers, type BackendLayer } from "@/api/layerApi";
import { getAssets, type BackendAsset } from "@/api/assetApi";
import {
  Box,
  Search,
  Download,
  Layers,
  MapPin,
  TrendingUp,
  Square,
  ChevronRight,
  RefreshCw,
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

function geomIcon(type: string) {
  const t = (type ?? "").toLowerCase();
  if (t.includes("point")) return <MapPin size={12} className="text-sky-400" />;
  if (t.includes("line")) return <TrendingUp size={12} className="text-yellow-400" />;
  if (t.includes("polygon")) return <Square size={12} className="text-rose-400" />;
  return <Box size={12} className="text-muted-foreground" />;
}

function exportCsv(assets: BackendAsset[], layerName: string) {
  if (!assets.length) return;

  // Collect all attribute keys
  const attrKeys = [...new Set(assets.flatMap((a) => Object.keys(a.attributes ?? {})))];
  const headers = ["id", "name", "layer_id", "created_at", ...attrKeys];
  const rows = assets.map((a) => [
    a.id,
    a.name ?? "",
    a.layer_id,
    a.created_at,
    ...attrKeys.map((k) => a.attributes?.[k] ?? ""),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${layerName.replace(/\s+/g, "_")}_assets.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────
// Assets Table Component
// ─────────────────────────────────────────────────────────────
interface AssetsTableProps {
  assets: BackendAsset[];
  loading: boolean;
  search: string;
}

function AssetsTable({ assets, loading, search }: AssetsTableProps) {
  const filtered = assets.filter((a) => {
    const q = search.toLowerCase();
    return (
      String(a.id).includes(q) ||
      (a.name ?? "").toLowerCase().includes(q) ||
      JSON.stringify(a.attributes ?? {}).toLowerCase().includes(q)
    );
  });

  // Determine attribute columns from first few assets
  const attrKeys = [...new Set(assets.slice(0, 50).flatMap((a) => Object.keys(a.attributes ?? {})))].slice(0, 6);

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Layer</TableHead>
            {attrKeys.map((k) => (
              <TableHead key={k} className="max-w-32">{k}</TableHead>
            ))}
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && [...Array(5)].map((_, i) => (
            <TableRow key={i}>
              {[...Array(5 + attrKeys.length)].map((_, j) => (
                <TableCell key={j}>
                  <div className="h-4 animate-pulse rounded bg-muted" />
                </TableCell>
              ))}
            </TableRow>
          ))}

          {!loading && filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={5 + attrKeys.length}>
                <div className="flex flex-col items-center py-16 text-center">
                  <Box size={40} className="mb-3 text-muted-foreground/40" />
                  <p className="font-medium">No assets found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {search ? `No results for "${search}".` : "This layer has no assets."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!loading && filtered.map((asset) => (
            <TableRow key={asset.id} className="hover:bg-muted/30">
              <TableCell className="font-mono text-xs text-muted-foreground">#{asset.id}</TableCell>
              <TableCell className="font-medium text-sm max-w-48 truncate">
                {asset.name ?? `Asset #${asset.id}`}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">#{asset.layer_id}</TableCell>
              {attrKeys.map((k) => (
                <TableCell key={k} className="text-sm max-w-32 truncate">
                  {String(asset.attributes?.[k] ?? "—")}
                </TableCell>
              ))}
              <TableCell className="text-sm">{fmtDate(asset.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function AssetsPage() {
  const [layers, setLayers] = useState<BackendLayer[]>([]);
  const [assets, setAssets] = useState<BackendAsset[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>("");
  const [loadingLayers, setLoadingLayers] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("table");

  // Load layers on mount
  const loadLayers = useCallback(async () => {
    setLoadingLayers(true);
    try {
      const data = await getLayers();
      setLayers(data);
      if (data.length > 0 && !selectedLayerId) {
        setSelectedLayerId(String(data[0].id));
      }
    } catch {
      setLayers([]);
    } finally {
      setLoadingLayers(false);
    }
  }, [selectedLayerId]);

  useEffect(() => { loadLayers(); }, [loadLayers]);

  // Load assets when layer changes
  const loadAssets = useCallback(async () => {
    if (!selectedLayerId) return;
    setLoadingAssets(true);
    setSearch("");
    try {
      const data = await getAssets(Number(selectedLayerId));
      setAssets(data);
    } catch {
      setAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  }, [selectedLayerId]);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  const selectedLayer = layers.find((l) => String(l.id) === selectedLayerId);

  return (
    <AppShell>
      <PageHeader
        title="Assets"
        subtitle="Explore spatial assets across all GIS layers"
      />

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Available Layers", value: layers.length, color: "text-violet-400" },
          { label: "Assets in Layer", value: assets.length.toLocaleString("en-IN"), color: "text-sky-400" },
          { label: "Attribute Columns", value: [...new Set(assets.slice(0, 20).flatMap((a) => Object.keys(a.attributes ?? {})))].length, color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Layer selector sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="border-b px-4 py-3">
              <p className="font-semibold text-sm">Select Layer</p>
              <p className="text-xs text-muted-foreground mt-0.5">Choose a layer to view its assets</p>
            </div>
            <div className="max-h-[calc(100vh-420px)] overflow-y-auto">
              {loadingLayers ? (
                <div className="p-4 space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
                  ))}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {layers.map((layer) => {
                    const active = String(layer.id) === selectedLayerId;
                    return (
                      <button
                        key={layer.id}
                        onClick={() => setSelectedLayerId(String(layer.id))}
                        className={`
                          w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-all
                          ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"}
                        `}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {geomIcon(layer.geometry_type)}
                          <span className="truncate">{layer.name}</span>
                        </span>
                        <span className={`shrink-0 text-xs ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {layer.feature_count ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {selectedLayer && (
              <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
                {geomIcon(selectedLayer.geometry_type)}
                <span className="text-sm font-medium">{selectedLayer.name}</span>
                <Badge variant="secondary" className="text-xs">{selectedLayer.geometry_type}</Badge>
              </div>
            )}

            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={loadAssets}
              disabled={loadingAssets}
              className="shrink-0"
            >
              <RefreshCw size={15} className={loadingAssets ? "animate-spin" : ""} />
            </Button>

            <Button
              variant="outline"
              className="gap-2 shrink-0"
              onClick={() => selectedLayer && exportCsv(assets, selectedLayer.name)}
              disabled={!assets.length}
            >
              <Download size={15} />
              Export CSV
            </Button>
          </div>

          {/* No layer selected */}
          {!selectedLayerId && !loadingLayers && (
            <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-24 text-center">
              <Layers size={40} className="mb-3 text-muted-foreground/40" />
              <p className="font-medium">Select a layer</p>
              <p className="mt-1 text-sm text-muted-foreground">Choose a layer from the left to view its assets.</p>
            </div>
          )}

          {/* Assets table */}
          {selectedLayerId && (
            <AssetsTable
              assets={assets}
              loading={loadingAssets}
              search={search}
            />
          )}

          {/* Count footer */}
          {selectedLayerId && !loadingAssets && assets.length > 0 && (
            <div className="rounded-xl border bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground text-center">
              {assets.filter((a) => {
                const q = search.toLowerCase();
                return !q || String(a.id).includes(q) || (a.name ?? "").toLowerCase().includes(q);
              }).length.toLocaleString("en-IN")} of {assets.length.toLocaleString("en-IN")} assets
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
