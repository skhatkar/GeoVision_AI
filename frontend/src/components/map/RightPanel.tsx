"use client";

import { useState, useEffect } from "react";
import { Info, Ruler, BrainCircuit, Sparkles, Layers } from "lucide-react";
import DrawingsPanel from "./DrawingsPanel";
import FeaturePanel from "@/components/feature/FeaturePanel";
import SpatialCopilot from "@/components/ai/SpatialCopilot";
import { useDrawingStore } from "@/store/drawingStore";
import { useSelectionStore } from "@/store/selectionStore";
import { Badge } from "@/components/ui/badge";

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<"features" | "drawings" | "ai">("features");
  const selectedFeature = useSelectionStore((s) => s.selectedFeature);
  const drawings = useDrawingStore((s) => s.drawings);
  const selectedDrawingId = useDrawingStore((s) => s.selectedDrawingId);

  // Auto-switch to features tab when feature is selected
  useEffect(() => {
    if (selectedFeature) {
      setActiveTab("features");
    }
  }, [selectedFeature]);

  // Auto-switch to drawings tab when a drawing is created/selected
  useEffect(() => {
    if (selectedDrawingId || drawings.length > 0) {
      setActiveTab("drawings");
    }
  }, [selectedDrawingId, drawings.length]);

  return (
    <aside className="w-84 border-l bg-card/90 backdrop-blur-md flex flex-col z-20 shadow-sm">
      {/* Tab Navigation Header */}
      <div className="border-b bg-muted/20 p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground uppercase tracking-wider">
            <Sparkles size={13} className="text-primary" />
            <span>Spatial Inspector</span>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex rounded-xl border bg-muted/50 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("features")}
            className={`
              flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium transition-all cursor-pointer
              ${
                activeTab === "features"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Info size={13} className={activeTab === "features" ? "text-primary" : ""} />
            <span>Features</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("drawings")}
            className={`
              flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium transition-all cursor-pointer
              ${
                activeTab === "drawings"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Ruler size={13} className={activeTab === "drawings" ? "text-amber-500" : ""} />
            <span>Drawings</span>
            {drawings.length > 0 && (
              <Badge variant="secondary" className="px-1 py-0 text-[10px] font-mono bg-amber-500/10 text-amber-600">
                {drawings.length}
              </Badge>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`
              flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium transition-all cursor-pointer
              ${
                activeTab === "ai"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <BrainCircuit size={13} className={activeTab === "ai" ? "text-violet-500" : ""} />
            <span>AI</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {activeTab === "features" && <FeaturePanel />}

        {activeTab === "drawings" && <DrawingsPanel />}

        {activeTab === "ai" && <SpatialCopilot />}
      </div>
    </aside>
  );
}