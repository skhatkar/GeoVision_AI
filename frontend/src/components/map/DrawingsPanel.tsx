"use client";

import { useState } from "react";
import {
  Trash2,
  Pentagon,
  Circle,
  Square,
  Slash,
  MapPin,
  Focus,
  Download,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Maximize2,
  FileSpreadsheet,
  FileCode,
  Ruler,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDrawingStore, type DrawnShapeItem } from "@/store/drawingStore";
import { useMapStore } from "@/store/mapStore";
import LayerIconBadge from "@/components/layers/LayerIconBadge";

export default function DrawingsPanel() {
  const drawings = useDrawingStore((s) => s.drawings);
  const selectedDrawingId = useDrawingStore((s) => s.selectedDrawingId);
  const selectDrawing = useDrawingStore((s) => s.selectDrawing);
  const removeDrawing = useDrawingStore((s) => s.removeDrawing);
  const clearDrawings = useDrawingStore((s) => s.clearDrawings);
  const map = useMapStore((s) => s.map);

  const [expandedBreakdowns, setExpandedBreakdowns] = useState<Record<string, boolean>>({});

  const toggleBreakdown = (id: string) => {
    setExpandedBreakdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleZoomToDrawing = (item: DrawnShapeItem) => {
    selectDrawing(item.id);
    if (!map) return;

    if (item.layer && typeof item.layer.getBounds === "function") {
      map.fitBounds(item.layer.getBounds(), { padding: [40, 40], maxZoom: 16 });
    } else if (item.analysis.center) {
      map.flyTo(item.analysis.center, 15, { duration: 1 });
    }
  };

  const handleZoomToAsset = (asset: any) => {
    if (asset.latitude && asset.longitude && map) {
      map.flyTo([asset.latitude, asset.longitude], 17, { duration: 1.2 });
    }
  };

  const handleExportGeoJSON = (item: DrawnShapeItem) => {
    if (!item.analysis.geoJson) return;
    const blob = new Blob([JSON.stringify(item.analysis.geoJson, null, 2)], {
      type: "application/geo+json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${item.name.replace(/\s+/g, "_")}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = (item: DrawnShapeItem) => {
    const breakdown = item.analysis.containedBreakdown;
    if (!breakdown || breakdown.totalCount === 0) return;

    const rows = ["Layer,Asset ID,Asset Name,Latitude,Longitude,Attributes"];
    breakdown.layers.forEach((l) => {
      l.assets.forEach((a) => {
        const attrStr = JSON.stringify(a.attributes || {}).replace(/"/g, '""');
        rows.push(
          `"${l.layerName}","${a.id}","${a.name}","${a.latitude ?? ""}","${a.longitude ?? ""}","${attrStr}"`
        );
      });
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${item.name.replace(/\s+/g, "_")}_contained_assets.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (drawings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card/40 p-4 text-center space-y-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto">
          <Ruler size={20} />
        </div>
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Spatial Drawings & AOI Analytics
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Use the top toolbar to draw a <strong>Polygon, Rectangle, Circle, or Polyline</strong> to compute exact area, perimeter, and analyze intersecting assets in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card/70 backdrop-blur-xs p-3.5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles size={15} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Drawing & AOI Analytics
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {drawings.length} {drawings.length === 1 ? "shape active" : "shapes active"}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={clearDrawings}
          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
        >
          Clear All
        </Button>
      </div>

      {/* Drawings List */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-0.5">
        {drawings.map((item) => {
          const isSelected = selectedDrawingId === item.id;
          const isExpanded = expandedBreakdowns[item.id] ?? true;
          const { analysis } = item;
          const hasAssets = analysis.containedBreakdown && analysis.containedBreakdown.totalCount > 0;

          return (
            <div
              key={item.id}
              onClick={() => selectDrawing(item.id)}
              className={`
                rounded-xl border p-3 transition-all cursor-pointer space-y-3
                ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                    : "border-border/70 bg-card hover:border-primary/40 hover:bg-card/90"
                }
              `}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-primary shrink-0">
                    {analysis.shapeType === "Polygon" && <Pentagon size={14} />}
                    {analysis.shapeType === "Rectangle" && <Square size={14} />}
                    {analysis.shapeType === "Circle" && <Circle size={14} />}
                    {analysis.shapeType === "Line" && <Slash size={14} />}
                    {analysis.shapeType === "Marker" && <MapPin size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Created at {item.createdAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-sky-500 hover:bg-sky-500/10 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoomToDrawing(item);
                    }}
                    title="Zoom to drawing"
                  >
                    <Focus size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDrawing(item.id);
                    }}
                    title="Delete drawing"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {/* Measurement Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Area Metrics (for Polygons / Circles / Rectangles) */}
                {analysis.areaSqKm !== undefined && (
                  <div className="rounded-lg bg-muted/40 p-2 border border-border/40 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Area
                    </p>
                    <p className="text-xs font-bold font-mono text-foreground">
                      {analysis.areaSqKm >= 0.01 ? `${analysis.areaSqKm} km²` : `${analysis.areaSqMeters?.toLocaleString()} m²`}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {analysis.areaHectares} ha · {analysis.areaAcres} ac
                    </p>
                  </div>
                )}

                {/* Perimeter / Length Metrics */}
                {(analysis.perimeterKm !== undefined || analysis.lengthKm !== undefined) && (
                  <div className="rounded-lg bg-muted/40 p-2 border border-border/40 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      {analysis.shapeType === "Line" ? "Corridor Length" : "Perimeter"}
                    </p>
                    <p className="text-xs font-bold font-mono text-foreground">
                      {analysis.lengthKm !== undefined ? `${analysis.lengthKm} km` : `${analysis.perimeterKm} km`}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {((analysis.lengthKm ?? analysis.perimeterKm ?? 0) * 1000).toLocaleString()} meters
                    </p>
                  </div>
                )}

                {/* Circle Radius */}
                {analysis.radiusMeters !== undefined && (
                  <div className="rounded-lg bg-muted/40 p-2 border border-border/40 space-y-0.5 col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Circle Radius
                    </p>
                    <p className="text-xs font-bold font-mono text-foreground">
                      {analysis.radiusMeters >= 1000
                        ? `${(analysis.radiusMeters / 1000).toFixed(2)} km`
                        : `${analysis.radiusMeters.toFixed(1)} meters`}
                    </p>
                  </div>
                )}

                {/* Center Coordinates */}
                {analysis.center && (
                  <div className="rounded-lg bg-muted/40 p-2 border border-border/40 space-y-0.5 col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Center GPS
                    </p>
                    <p className="text-[11px] font-mono text-foreground">
                      {analysis.center[0].toFixed(5)}° N, {analysis.center[1].toFixed(5)}° E
                    </p>
                  </div>
                )}
              </div>

              {/* Spatial Containment Asset Breakdown */}
              <div className="rounded-lg border bg-muted/20 overflow-hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBreakdown(item.id);
                  }}
                  className="flex w-full items-center justify-between p-2 hover:bg-muted/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    <Layers size={13} className="text-primary shrink-0" />
                    <span className="text-xs font-semibold truncate">
                      Assets Inside Area
                    </span>
                  </div>

                  <Badge
                    variant="secondary"
                    className={`font-mono text-[10px] px-1.5 py-0 ${hasAssets ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    {analysis.containedBreakdown.totalCount} {analysis.containedBreakdown.totalCount === 1 ? "asset" : "assets"}
                  </Badge>
                </button>

                {isExpanded && (
                  <div className="border-t p-2 space-y-2 bg-background/50">
                    {!hasAssets ? (
                      <p className="text-[11px] text-muted-foreground text-center py-1">
                        No active GIS assets intersect this drawn area.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {analysis.containedBreakdown.layers.map((layerGrp) => (
                          <div
                            key={layerGrp.layerId}
                            className="rounded-md border bg-card p-2 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <LayerIconBadge
                                  geometryType={layerGrp.geometryType}
                                  icon={layerGrp.icon}
                                  customIcon={layerGrp.customIcon}
                                  color={layerGrp.color}
                                  size="sm"
                                />
                                <span className="font-semibold truncate">
                                  {layerGrp.layerName}
                                </span>
                              </div>
                              <Badge variant="outline" className="font-mono text-[10px] px-1 py-0">
                                {layerGrp.count}
                              </Badge>
                            </div>

                            {/* Mini Asset Pills */}
                            <div className="space-y-1 pt-1">
                              {layerGrp.assets.slice(0, 3).map((a, idx) => (
                                <div
                                  key={a.id ?? idx}
                                  className="flex items-center justify-between text-[11px] bg-muted/40 p-1.5 rounded"
                                >
                                  <span className="truncate max-w-[150px] font-medium">
                                    {a.name}
                                  </span>
                                  {a.latitude && a.longitude && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleZoomToAsset(a);
                                      }}
                                      className="text-sky-500 hover:text-sky-600 cursor-pointer"
                                      title="Zoom to asset"
                                    >
                                      <Focus size={12} />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {layerGrp.assets.length > 3 && (
                                <p className="text-[10px] text-muted-foreground text-center pt-0.5">
                                  +{layerGrp.assets.length - 3} more in this layer
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons: Export GeoJSON / CSV */}
              <div className="flex items-center gap-1.5 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-[11px] gap-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportGeoJSON(item);
                  }}
                  title="Download GeoJSON boundary of drawn AOI"
                >
                  <FileCode size={12} />
                  <span>GeoJSON</span>
                </Button>

                {hasAssets && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-[11px] gap-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportCSV(item);
                    }}
                    title="Export CSV of assets inside this AOI"
                  >
                    <FileSpreadsheet size={12} />
                    <span>Assets CSV</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}