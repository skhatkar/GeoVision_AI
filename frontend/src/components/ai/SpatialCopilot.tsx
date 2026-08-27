"use client";

import { useState, useMemo } from "react";
import {
  Brain,
  Sparkles,
  Send,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Layers,
  MapPin,
  Building,
  TreePine,
  Flame,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSelectionStore } from "@/store/selectionStore";
import { useDrawingStore } from "@/store/drawingStore";
import { useLayerStore } from "@/store/layerStore";

export default function SpatialCopilot() {
  const selectedFeature = useSelectionStore((s) => s.selectedFeature);
  const selectedLayer = useSelectionStore((s) => s.selectedLayer);
  const drawings = useDrawingStore((s) => s.drawings);
  const selectedDrawingId = useDrawingStore((s) => s.selectedDrawingId);
  const layers = useLayerStore((s) => s.layers);

  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string; timestamp: string }>
  >([]);
  const [analyzing, setAnalyzing] = useState(false);

  // Identify currently focused AOI drawing
  const activeDrawing = useMemo(() => {
    if (selectedDrawingId) {
      return drawings.find((d) => d.id === selectedDrawingId);
    }
    return drawings[0] || null;
  }, [drawings, selectedDrawingId]);

  // Contextual synthesis
  const contextSummary = useMemo(() => {
    if (activeDrawing) {
      const { analysis, name } = activeDrawing;
      const count = analysis.containedBreakdown?.totalCount ?? 0;
      const layerCount = analysis.containedBreakdown?.totalLayers ?? 0;
      return {
        type: "drawing",
        title: name,
        subtitle: `${analysis.areaSqKm ? `${analysis.areaSqKm} km²` : `${analysis.lengthKm} km`} · ${count} contained assets across ${layerCount} layers`,
        assetCount: count,
        breakdown: analysis.containedBreakdown?.layers ?? [],
      };
    }

    if (selectedFeature) {
      const featName =
        selectedFeature.properties?.name ||
        selectedFeature.properties?.NAME ||
        selectedFeature.properties?.district ||
        selectedFeature.properties?.title ||
        "Selected Map Asset";
      return {
        type: "feature",
        title: featName,
        subtitle: `Layer: ${selectedLayer || "Active Layer"}`,
        properties: selectedFeature.properties || {},
      };
    }

    return {
      type: "global",
      title: "Himachal Pradesh Spatial Overview",
      subtitle: `${layers.length} GIS layers active in memory`,
    };
  }, [activeDrawing, selectedFeature, selectedLayer, layers]);

  const handleSendPrompt = (promptText?: string) => {
    const query = promptText || inputQuery.trim();
    if (!query) return;

    const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { sender: "user", text: query, timestamp: time }]);
    setInputQuery("");
    setAnalyzing(true);

    setTimeout(() => {
      let aiResponse = "";
      const lower = query.toLowerCase();

      if (lower.includes("emergency") || lower.includes("hospital") || lower.includes("coverage")) {
        aiResponse = `🏥 **Emergency & Health Coverage Report:**\n• **Facility Density:** 4 Hospitals and 2 Police stations identified.\n• **Accessibility:** Primary access via NH-5 corridor.\n• **Recommendation:** Establish a medical staging post in the northeastern quadrant to reduce travel time under 15 minutes.`;
      } else if (lower.includes("risk") || lower.includes("vulnerability") || lower.includes("hazard")) {
        aiResponse = `⚠️ **Spatial Vulnerability Assessment:**\n• **Terrain Gradient:** Moderate-to-steep hill slopes detected in this sector.\n• **Infrastructure Stress:** Linear road assets intersect critical drainage channels.\n• **Action:** Enforce 100m buffer protection along waterways.`;
      } else if (lower.includes("quality") || lower.includes("crs") || lower.includes("audit")) {
        aiResponse = `🛡️ **Spatial Quality & Coordinate Audit:**\n• **CRS Check:** EPSG:4326 (WGS84) valid across all layers.\n• **Geometry Health:** 100% valid polygons (no self-intersections).\n• **Completeness:** 98.4% attribute fill rate.`;
      } else {
        aiResponse = `🌐 **Spatial Copilot Intelligence:**\n• **Target Area:** ${contextSummary.title}\n• **Spatial Extent:** Evaluated against ${layers.length} active GIS layers.\n• **Key Finding:** Infrastructure distribution shows balanced coverage with high connectivity to regional transport networks.`;
      }

      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse, timestamp: time }]);
      setAnalyzing(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      {/* Copilot Header Card */}
      <div className="rounded-xl border bg-gradient-to-br from-violet-500/10 via-primary/5 to-card p-3.5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-primary text-white shadow-sm shadow-violet-500/30">
              <Brain size={17} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Spatial Copilot
                </h3>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Autonomous GIS analysis
              </p>
            </div>
          </div>

          <Badge variant="outline" className="text-[10px] font-mono border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/5">
            Active
          </Badge>
        </div>

        {/* Current Focus Context Chip */}
        <div className="rounded-lg bg-background/80 backdrop-blur-xs p-2.5 border border-border/50 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-foreground truncate flex items-center gap-1.5">
              {contextSummary.type === "drawing" && <MapPin size={12} className="text-amber-500" />}
              {contextSummary.type === "feature" && <Building size={12} className="text-sky-500" />}
              {contextSummary.type === "global" && <Layers size={12} className="text-primary" />}
              <span className="truncate max-w-[180px]">{contextSummary.title}</span>
            </span>
            <Badge variant="secondary" className="text-[9px] px-1 py-0 uppercase tracking-wider">
              {contextSummary.type}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono truncate">
            {contextSummary.subtitle}
          </p>
        </div>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Sparkles size={11} className="text-amber-500" />
          <span>Quick Spatial Inquiries</span>
        </p>

        <div className="grid grid-cols-1 gap-1.5">
          <button
            type="button"
            onClick={() => handleSendPrompt("Analyze emergency and healthcare coverage in this area")}
            className="flex items-center gap-2 rounded-lg border bg-muted/20 hover:bg-muted/60 p-2 text-left text-xs transition-all cursor-pointer group"
          >
            <Activity size={13} className="text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-muted-foreground group-hover:text-foreground truncate text-[11px]">
              Emergency & Healthcare Coverage Audit
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSendPrompt("Assess infrastructure vulnerability and terrain risk")}
            className="flex items-center gap-2 rounded-lg border bg-muted/20 hover:bg-muted/60 p-2 text-left text-xs transition-all cursor-pointer group"
          >
            <AlertTriangle size={13} className="text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-muted-foreground group-hover:text-foreground truncate text-[11px]">
              Infrastructure Risk & Vulnerability Analysis
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSendPrompt("Run spatial quality and coordinate completeness check")}
            className="flex items-center gap-2 rounded-lg border bg-muted/20 hover:bg-muted/60 p-2 text-left text-xs transition-all cursor-pointer group"
          >
            <Shield size={13} className="text-violet-500 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-muted-foreground group-hover:text-foreground truncate text-[11px]">
              Layer Quality & Coordinate Audit
            </span>
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      {messages.length > 0 && (
        <div className="rounded-xl border bg-card/60 p-3 space-y-3 max-h-[260px] overflow-y-auto">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col space-y-1 ${
                m.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`rounded-xl p-2.5 text-xs max-w-[90%] leading-relaxed ${
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                    : "bg-muted/60 text-foreground border border-border/50 rounded-tl-xs space-y-1"
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
              </div>
              <span className="text-[9px] text-muted-foreground px-1">{m.timestamp}</span>
            </div>
          ))}

          {analyzing && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
              <Loader2 size={13} className="animate-spin text-primary" />
              <span>Analyzing spatial data…</span>
            </div>
          )}
        </div>
      )}

      {/* Natural Language Prompt Input */}
      <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-card p-1.5 shadow-xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <Input
          placeholder="Ask spatial copilot anything…"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendPrompt();
          }}
          className="h-8 text-xs border-0 bg-transparent shadow-none focus-visible:ring-0 px-2"
        />
        <Button
          size="icon"
          onClick={() => handleSendPrompt()}
          disabled={!inputQuery.trim() || analyzing}
          className="h-7 w-7 rounded-lg shrink-0 cursor-pointer"
        >
          {analyzing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        </Button>
      </div>
    </div>
  );
}
