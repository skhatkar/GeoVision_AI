"use client";

import { useState, useEffect } from "react";
import { Info, Ruler, BrainCircuit, Sparkles, MapPin } from "lucide-react";
import DrawingsPanel from "./DrawingsPanel";
import FeaturePanel from "@/components/feature/FeaturePanel";
import AssetInspectorPanel from "@/components/feature/AssetInspectorPanel";
import SpatialCopilot from "@/components/ai/SpatialCopilot";
import { useDrawingStore } from "@/store/drawingStore";
import { useSelectionStore } from "@/store/selectionStore";
import { useSpatialFilterStore } from "@/store/spatialFilterStore";
import { Badge } from "@/components/ui/badge";

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<"features" | "assets" | "drawings" | "ai">("features");
  const selectedFeature = useSelectionStore((s) => s.selectedFeature);
  const drawings = useDrawingStore((s) => s.drawings);
  const selectedDrawingId = useDrawingStore((s) => s.selectedDrawingId);
  const filteredAssets = useSpatialFilterStore((s) => s.filteredAssets);
  const isFilterActive = useSpatialFilterStore(
    (s) => Boolean(s.selectedDistrict || s.selectedBlock || s.selectedPanchayat)
  );

  // Auto-switch to features tab when a map feature is selected
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

  // Auto-switch to assets tab when spatial filter loads new results
  useEffect(() => {
    if (isFilterActive && filteredAssets.length > 0) {
      setActiveTab("assets");
    }
  }, [isFilterActive, filteredAssets.length]);

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
        <div className="grid grid-cols-4 rounded-xl border bg-muted/50 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("features")}
            className={`
              flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 font-medium transition-all cursor-pointer
              ${
                activeTab === "features"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Info size={12} className={activeTab === "features" ? "text-primary" : ""} />
            <span className="text-[10px]">Feature</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("assets")}
            className={`
              flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 font-medium transition-all cursor-pointer relative
              ${
                activeTab === "assets"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <MapPin size={12} className={activeTab === "assets" ? "text-emerald-500" : ""} />
            <span className="text-[10px]">Assets</span>
            {isFilterActive && filteredAssets.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 text-[8px] font-bold text-white flex items-center justify-center">
                {filteredAssets.length > 99 ? "99+" : filteredAssets.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("drawings")}
            className={`
              flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 font-medium transition-all cursor-pointer
              ${
                activeTab === "drawings"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Ruler size={12} className={activeTab === "drawings" ? "text-amber-500" : ""} />
            <span className="text-[10px]">Drawings</span>
            {drawings.length > 0 && (
              <span className="absolute hidden">{drawings.length}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`
              flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 font-medium transition-all cursor-pointer
              ${
                activeTab === "ai"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <BrainCircuit size={12} className={activeTab === "ai" ? "text-violet-500" : ""} />
            <span className="text-[10px]">AI</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {activeTab === "features" && <FeaturePanel />}
        {activeTab === "assets" && <AssetInspectorPanel />}
        {activeTab === "drawings" && <DrawingsPanel />}
        {activeTab === "ai" && <SpatialCopilot />}
      </div>
    </aside>
  );
}
