"use client";

import { useMemo } from "react";
import {
  Workflow,
  ChevronRight,
  Database,
  Layers,
  MapPin,
  Cpu,
  CheckCircle2,
  Code2,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  selectedTool: any;
  params: Record<string, string>;
  layers: any[];
  result: any;
}

export default function AnalysisWorkflowPipeline({
  selectedTool,
  params,
  layers,
  result,
}: Props) {
  // Find names for layer parameters
  const inputLayers = useMemo(() => {
    if (!selectedTool || !params) return [];

    const found: { key: string; label: string; name: string; count?: number }[] = [];
    selectedTool.params.forEach((p: any) => {
      if (p.type === "layer" && params[p.key]) {
        const match = layers.find((l) => String(l.id) === String(params[p.key]));
        found.push({
          key: p.key,
          label: p.label,
          name: match ? match.name : `Layer #${params[p.key]}`,
          count: match?.feature_count,
        });
      }
    });

    return found;
  }, [selectedTool, params, layers]);

  // Extract total output features count
  const outputCount = useMemo(() => {
    if (!result) return 0;
    if (Array.isArray(result)) return result.length;
    if (result.count !== undefined) return result.count;
    if (result.feature_count !== undefined) return result.feature_count;
    const items = result.features || result.results || result.assets || result.centroids;
    if (Array.isArray(items)) return items.length;
    return 1;
  }, [result]);

  if (!selectedTool) return null;

  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <Workflow size={16} className="text-violet-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Spatial Workflow Model & Data Flow Pipeline
          </h4>
        </div>

        <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
          PostGIS 3.4 / GEOS Engine Active
        </Badge>
      </div>

      {/* Pipeline Node Diagram */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-muted/20">
        {/* Node 1: Input Layer / GPS Origin */}
        <div className="flex-1 rounded-xl border border-border/70 bg-card p-3 shadow-xs space-y-1.5 min-w-[180px]">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Database size={13} className="text-cyan-500" />
            <span>Input GIS Source</span>
          </div>

          {inputLayers.length > 0 ? (
            <div className="space-y-1">
              {inputLayers.map((inLg) => (
                <div key={inLg.key} className="text-xs font-semibold text-foreground truncate flex items-center justify-between">
                  <span className="truncate">{inLg.name}</span>
                  {inLg.count !== undefined && (
                    <span className="text-[10px] font-mono text-muted-foreground ml-1 font-normal">
                      ({inLg.count} feats)
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : params.lat && params.lng ? (
            <div className="text-xs font-mono text-cyan-400 font-semibold truncate">
              📍 ({Number(params.lat).toFixed(4)}, {Number(params.lng).toFixed(4)})
            </div>
          ) : (
            <div className="text-xs font-semibold text-foreground">
              Target GIS Layer #{params.layer_id || params.asset_id || 1}
            </div>
          )}
        </div>

        {/* Connector Arrow 1 */}
        <div className="flex items-center justify-center text-muted-foreground/60 shrink-0">
          <ChevronRight size={20} className="hidden md:block text-violet-500 animate-pulse" />
          <div className="block md:hidden text-center text-xs font-bold text-violet-500">↓</div>
        </div>

        {/* Node 2: Spatial Transformation Engine */}
        <div className="flex-1 rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 shadow-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-400">
            <Cpu size={13} />
            <span>Spatial Algorithm</span>
          </div>

          <p className="text-xs font-bold text-foreground truncate">
            {selectedTool.label}
          </p>

          <p className="text-[10px] font-mono text-muted-foreground truncate">
            {selectedTool.category} · {params.distance ? `Dist: ${params.distance}m` : "PostGIS ST_Op"}
          </p>
        </div>

        {/* Connector Arrow 2 */}
        <div className="flex items-center justify-center text-muted-foreground/60 shrink-0">
          <ChevronRight size={20} className="hidden md:block text-emerald-500 animate-pulse" />
          <div className="block md:hidden text-center text-xs font-bold text-emerald-500">↓</div>
        </div>

        {/* Node 3: Output Results */}
        <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 shadow-xs space-y-1.5 min-w-[180px]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              <span>Output Dataset</span>
            </div>
            {result && <span className="text-[9px] font-mono text-emerald-500 font-bold">READY</span>}
          </div>

          <p className="text-base font-bold font-mono text-foreground">
            {result ? `${outputCount} Features` : "Pending Run"}
          </p>

          <p className="text-[10px] text-muted-foreground">
            {result ? "GeoJSON Vector Layer Rendered" : "Execute tool to produce model output"}
          </p>
        </div>
      </div>
    </div>
  );
}
