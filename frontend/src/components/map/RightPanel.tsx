"use client";

import { Info, BrainCircuit } from "lucide-react";

import DrawingsPanel from "./DrawingsPanel";
import FeaturePanel from "@/components/feature/FeaturePanel";

export default function RightPanel() {
  return (
    <aside className="w-80 border-l bg-background flex flex-col">

      {/* Header */}
      <div className="border-b p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Info className="h-5 w-5 text-sky-500" />
          Information
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Selected Feature Details
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-auto p-4">

        <FeaturePanel />

        <DrawingsPanel />

        <div className="rounded-xl border p-4">

          <div className="flex items-center gap-2 font-medium">

            <BrainCircuit
              className="h-4 w-4 text-violet-500"
            />

            AI Insights

          </div>

          <div className="mt-3 text-sm text-muted-foreground">

            AI insights for the selected feature
            will appear here.

          </div>

        </div>

      </div>

    </aside>
  );
}