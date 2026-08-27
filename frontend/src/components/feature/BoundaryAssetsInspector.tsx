"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Layers,
  Search,
  Focus,
  Download,
  ChevronDown,
  ChevronRight,
  Sparkles,
  MapPin,
  Folder,
  FolderOpen,
  Filter,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSelectionStore } from "@/store/selectionStore";
import { useLayerStore } from "@/store/layerStore";
import { useMapStore } from "@/store/mapStore";
import LayerIconBadge from "@/components/layers/LayerIconBadge";
import {
  isPolygonFeature,
  queryBoundaryAssets,
  type BoundaryAnalysisResult,
  type LayerAssetBreakdown,
} from "@/lib/spatialAnalysis";

export default function BoundaryAssetsInspector() {
  const { selectedFeature, selectedLayer } = useSelectionStore();
  const layers = useLayerStore((s) => s.layers);
  const geoJsonData = useLayerStore((s) => s.geoJsonData);
  const map = useMapStore((s) => s.map);

  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<BoundaryAnalysisResult | null>(null);
  const [search, setSearch] = useState("");
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"project_groups" | "layer_groups">("project_groups");
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({});

  const isPolygon = useMemo(() => isPolygonFeature(selectedFeature), [selectedFeature]);

  useEffect(() => {
    if (!isPolygon || !selectedFeature) {
      setAnalysisResult(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const geoJsonMap = new Map<string, any>(Object.entries(geoJsonData));
    const containerLayer = layers.find((l) => l.name === selectedLayer);
    const containerLayerId = containerLayer?.id ?? null;

    queryBoundaryAssets(selectedFeature, layers, geoJsonMap, containerLayerId, selectedLayer)
      .then((res) => {
        if (isMounted) {
          setAnalysisResult(res);

          // By default expand all project groups & layer groups
          const defProj: Record<string, boolean> = {};
          const defLayers: Record<string, boolean> = {};

          res.layers.forEach((l) => {
            const pId = l.projectId ? String(l.projectId) : "general";
            defProj[pId] = true;
            defLayers[String(l.layerId)] = true;
          });

          setExpandedProjects(defProj);
          setExpandedLayers(defLayers);
        }
      })
      .catch((err) => {
        console.error("Boundary asset query error:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedFeature, isPolygon, layers, geoJsonData, selectedLayer]);

  if (!isPolygon || !selectedFeature) {
    return null;
  }

  const toggleProjectExpand = (pId: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [pId]: !prev[pId],
    }));
  };

  const toggleLayerExpand = (layerId: string | number) => {
    const key = String(layerId);
    setExpandedLayers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleZoomToAsset = (asset: any) => {
    if (asset.latitude && asset.longitude && map) {
      map.flyTo([asset.latitude, asset.longitude], 16, {
        duration: 1.2,
      });
    }
  };

  // Distinct projects detected within this boundary
  const detectedProjects = useMemo(() => {
    if (!analysisResult) return [];
    const map = new Map<string, { id: string; name: string; count: number }>();

    analysisResult.layers.forEach((l) => {
      const pId = l.projectId ? String(l.projectId) : "general";
      const pName = l.projectName || (pId === "general" ? "General / Base Layers" : `Project #${pId}`);
      if (!map.has(pId)) {
        map.set(pId, { id: pId, name: pName, count: 0 });
      }
      map.get(pId)!.count += l.count;
    });

    return Array.from(map.values());
  }, [analysisResult]);

  // Filter layers & assets by search term and project filter
  const filteredLayers = useMemo(() => {
    if (!analysisResult) return [];

    let currentLayers = analysisResult.layers;

    // Filter by Project
    if (selectedProjectFilter !== "all") {
      currentLayers = currentLayers.filter(
        (l) => (l.projectId ? String(l.projectId) : "general") === selectedProjectFilter
      );
    }

    // Filter by search term
    if (search.trim()) {
      const term = search.toLowerCase();
      currentLayers = currentLayers
        .map((l) => {
          const matchingAssets = l.assets.filter((a) => {
            const nameMatch = a.name.toLowerCase().includes(term);
            const attrMatch = Object.values(a.attributes || {}).some((v) =>
              String(v).toLowerCase().includes(term)
            );
            return nameMatch || attrMatch;
          });

          return {
            ...l,
            assets: matchingAssets,
            count: matchingAssets.length,
          };
        })
        .filter((l) => l.count > 0 || l.layerName.toLowerCase().includes(term));
    }

    return currentLayers;
  }, [analysisResult, search, selectedProjectFilter]);

  // Group filtered layers by Project
  const projectLayerGroups = useMemo(() => {
    const map = new Map<string, { id: string; name: string; layers: LayerAssetBreakdown[]; totalAssets: number }>();

    filteredLayers.forEach((l) => {
      const pId = l.projectId ? String(l.projectId) : "general";
      const pName = l.projectName || (pId === "general" ? "General / Base Layers" : `Project #${pId}`);
      if (!map.has(pId)) {
        map.set(pId, { id: pId, name: pName, layers: [], totalAssets: 0 });
      }
      const group = map.get(pId)!;
      group.layers.push(l);
      group.totalAssets += l.count;
    });

    return Array.from(map.values());
  }, [filteredLayers]);

  const totalFilteredAssets = useMemo(() => {
    return filteredLayers.reduce((acc, l) => acc + l.count, 0);
  }, [filteredLayers]);

  const handleExportCSV = () => {
    if (!analysisResult || analysisResult.totalCount === 0) return;

    const rows: string[] = ["Project,Layer,Asset ID,Asset Name,Latitude,Longitude,Attributes"];
    analysisResult.layers.forEach((l) => {
      const pName = l.projectName || (l.projectId ? `Project #${l.projectId}` : "General / Base Layer");
      l.assets.forEach((a) => {
        const attrString = JSON.stringify(a.attributes || {}).replace(/"/g, '""');
        rows.push(
          `"${pName}","${l.layerName}","${a.id}","${a.name}","${a.latitude ?? ""}","${a.longitude ?? ""}","${attrString}"`
        );
      });
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `boundary_assets_${analysisResult.boundaryName || "export"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-xl border bg-card/60 backdrop-blur-xs p-3.5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles size={15} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Boundary Asset Breakdown
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Project & layer containment
            </p>
          </div>
        </div>

        {analysisResult && analysisResult.totalCount > 0 && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={handleExportCSV}
            title="Export CSV of assets in boundary"
          >
            <Download size={14} />
          </Button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
          <Loader2 size={20} className="animate-spin text-primary" />
          <span className="text-xs">Analyzing assets inside boundary…</span>
        </div>
      )}

      {/* Summary Box */}
      {!loading && analysisResult && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5 text-xs">
            <div className="space-y-0.5 min-w-0 flex-1 pr-2">
              <p className="font-semibold text-foreground truncate">
                {analysisResult.boundaryName}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {detectedProjects.length} {detectedProjects.length === 1 ? "project" : "projects"} · {analysisResult.totalLayers} {analysisResult.totalLayers === 1 ? "layer" : "layers"}
              </p>
            </div>
            <Badge
              variant="default"
              className="bg-primary/90 hover:bg-primary font-mono text-xs px-2.5 py-0.5 shrink-0"
            >
              {totalFilteredAssets} {totalFilteredAssets === 1 ? "Asset" : "Assets"}
            </Badge>
          </div>

          {/* Project Filter Pills */}
          {detectedProjects.length > 1 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Filter size={10} />
                  <span>Filter by Project</span>
                </span>
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === "project_groups" ? "layer_groups" : "project_groups")}
                  className="text-primary hover:underline cursor-pointer lowercase"
                >
                  {viewMode === "project_groups" ? "flat view" : "project view"}
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedProjectFilter("all")}
                  className={`
                    flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition-all cursor-pointer
                    ${
                      selectedProjectFilter === "all"
                        ? "bg-primary text-primary-foreground font-medium"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  All ({analysisResult.totalCount})
                </button>

                {detectedProjects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProjectFilter(p.id)}
                    className={`
                      flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition-all cursor-pointer
                      ${
                        selectedProjectFilter === p.id
                          ? "bg-primary text-primary-foreground font-medium"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }
                    `}
                  >
                    <Folder size={10} className="text-amber-500" />
                    <span className="truncate max-w-[100px]">{p.name}</span>
                    <span className="opacity-75">({p.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search within boundary */}
          {analysisResult.totalCount > 0 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search assets in boundary…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs bg-background/50"
              />
            </div>
          )}

          {/* Content */}
          {filteredLayers.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted-foreground">
              {search ? "No assets matching search inside this boundary." : "No assets found inside this boundary."}
            </div>
          ) : viewMode === "project_groups" ? (
            /* Hierarchical Project Folders Breakdown */
            <div className="space-y-2.5 max-h-[390px] overflow-y-auto pr-0.5">
              {projectLayerGroups.map((pGroup) => {
                const isProjectExpanded = !!expandedProjects[pGroup.id];

                return (
                  <div
                    key={pGroup.id}
                    className="rounded-lg border bg-background/60 overflow-hidden"
                  >
                    {/* Project Folder Header */}
                    <button
                      type="button"
                      onClick={() => toggleProjectExpand(pGroup.id)}
                      className="flex w-full items-center justify-between p-2 bg-muted/40 hover:bg-muted/70 transition-colors text-left cursor-pointer border-b"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isProjectExpanded ? (
                          <ChevronDown size={13} className="text-muted-foreground" />
                        ) : (
                          <ChevronRight size={13} className="text-muted-foreground" />
                        )}
                        {isProjectExpanded ? (
                          <FolderOpen size={14} className="text-amber-500 shrink-0" />
                        ) : (
                          <Folder size={14} className="text-amber-500 shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-foreground truncate max-w-[170px]">
                          {pGroup.name}
                        </span>
                      </div>

                      <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 bg-muted">
                        {pGroup.totalAssets} {pGroup.totalAssets === 1 ? "asset" : "assets"}
                      </Badge>
                    </button>

                    {/* Layers inside this Project */}
                    {isProjectExpanded && (
                      <div className="p-2 space-y-2">
                        {pGroup.layers.map((layerGrp) => {
                          const isLayerExpanded = !!expandedLayers[String(layerGrp.layerId)];

                          return (
                            <div
                              key={layerGrp.layerId}
                              className="rounded-md border bg-card/60 overflow-hidden"
                            >
                              {/* Layer Header */}
                              <button
                                type="button"
                                onClick={() => toggleLayerExpand(layerGrp.layerId)}
                                className="flex w-full items-center justify-between p-2 hover:bg-muted/30 transition-colors text-left cursor-pointer"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <LayerIconBadge
                                    geometryType={layerGrp.geometryType}
                                    icon={layerGrp.icon}
                                    customIcon={layerGrp.customIcon}
                                    color={layerGrp.color}
                                    size="sm"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium truncate leading-tight">
                                      {layerGrp.layerName}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground capitalize">
                                      {layerGrp.geometryType}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <Badge
                                    variant="secondary"
                                    className="font-mono text-[10px] px-1.5 py-0 bg-muted text-foreground"
                                    style={{ borderLeft: `3px solid ${layerGrp.color}` }}
                                  >
                                    {layerGrp.count}
                                  </Badge>
                                  {isLayerExpanded ? (
                                    <ChevronDown size={13} className="text-muted-foreground" />
                                  ) : (
                                    <ChevronRight size={13} className="text-muted-foreground" />
                                  )}
                                </div>
                              </button>

                              {/* Assets List */}
                              {isLayerExpanded && (
                                <div className="border-t bg-muted/10 p-1.5 space-y-1">
                                  {layerGrp.assets.map((asset, idx) => (
                                    <div
                                      key={asset.id ?? idx}
                                      className="group flex items-center justify-between gap-2 rounded-md border bg-card/80 p-2 text-xs hover:border-primary/40 hover:bg-card transition-all"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium text-foreground truncate">
                                          {asset.name}
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-muted-foreground">
                                          {asset.latitude && asset.longitude && (
                                            <span className="font-mono bg-muted/60 px-1 rounded flex items-center gap-0.5">
                                              <MapPin size={9} />
                                              {asset.latitude.toFixed(4)}, {asset.longitude.toFixed(4)}
                                            </span>
                                          )}
                                          {Object.entries(asset.attributes || {})
                                            .filter(([k]) => !["id", "ID", "geom", "geometry"].includes(k))
                                            .slice(0, 2)
                                            .map(([k, v]) => (
                                              <span key={k} className="bg-muted/40 px-1 rounded truncate max-w-[100px]">
                                                {k}: {String(v)}
                                              </span>
                                            ))}
                                        </div>
                                      </div>

                                      {asset.latitude && asset.longitude && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-6 w-6 opacity-80 group-hover:opacity-100 shrink-0 text-sky-500 hover:bg-sky-500/10 cursor-pointer"
                                          onClick={() => handleZoomToAsset(asset)}
                                          title="Zoom to asset on map"
                                        >
                                          <Focus size={13} />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Flat Layer View */
            <div className="space-y-2 max-h-[390px] overflow-y-auto pr-0.5">
              {filteredLayers.map((layerGrp) => {
                const isExpanded = !!expandedLayers[String(layerGrp.layerId)];

                return (
                  <div
                    key={layerGrp.layerId}
                    className="rounded-lg border bg-background/50 overflow-hidden transition-all"
                  >
                    {/* Layer Group Header */}
                    <button
                      type="button"
                      onClick={() => toggleLayerExpand(layerGrp.layerId)}
                      className="flex w-full items-center justify-between p-2.5 hover:bg-muted/40 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <LayerIconBadge
                          geometryType={layerGrp.geometryType}
                          icon={layerGrp.icon}
                          customIcon={layerGrp.customIcon}
                          color={layerGrp.color}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate leading-tight">
                            {layerGrp.layerName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-muted-foreground capitalize">
                              {layerGrp.geometryType}
                            </span>
                            {layerGrp.projectName && (
                              <span className="text-[10px] text-amber-500/90 flex items-center gap-0.5 truncate max-w-[110px]">
                                <Folder size={9} />
                                {layerGrp.projectName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="secondary"
                          className="font-mono text-[10px] px-1.5 py-0 bg-muted text-foreground"
                          style={{ borderLeft: `3px solid ${layerGrp.color}` }}
                        >
                          {layerGrp.count}
                        </Badge>
                        {isExpanded ? (
                          <ChevronDown size={14} className="text-muted-foreground" />
                        ) : (
                          <ChevronRight size={14} className="text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Assets list */}
                    {isExpanded && (
                      <div className="border-t bg-muted/10 p-2 space-y-1.5">
                        {layerGrp.assets.map((asset, idx) => (
                          <div
                            key={asset.id ?? idx}
                            className="group flex items-center justify-between gap-2 rounded-md border bg-card/80 p-2 text-xs hover:border-primary/40 hover:bg-card transition-all"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground truncate">
                                {asset.name}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-muted-foreground">
                                {asset.latitude && asset.longitude && (
                                  <span className="font-mono bg-muted/60 px-1 rounded flex items-center gap-0.5">
                                    <MapPin size={9} />
                                    {asset.latitude.toFixed(4)}, {asset.longitude.toFixed(4)}
                                  </span>
                                )}
                                {Object.entries(asset.attributes || {})
                                  .filter(([k]) => !["id", "ID", "geom", "geometry"].includes(k))
                                  .slice(0, 2)
                                  .map(([k, v]) => (
                                    <span key={k} className="bg-muted/40 px-1 rounded truncate max-w-[110px]">
                                      {k}: {String(v)}
                                    </span>
                                  ))}
                              </div>
                            </div>

                            {asset.latitude && asset.longitude && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 opacity-80 group-hover:opacity-100 shrink-0 text-sky-500 hover:bg-sky-500/10 cursor-pointer"
                                onClick={() => handleZoomToAsset(asset)}
                                title="Zoom to asset on map"
                              >
                                <Focus size={13} />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
