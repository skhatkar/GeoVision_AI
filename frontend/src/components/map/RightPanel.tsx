"use client";

import {
  Info,
  MapPinned,
  Database,
  BrainCircuit,
} from "lucide-react";

import SelectedFeature from "./SelectedFeature";
import { useSelectionStore } from "@/store/selectionStore";

export default function RightPanel() {
  const feature = useSelectionStore(
    (s) => s.selectedFeature
  );

  const layer = useSelectionStore(
    (s) => s.selectedLayer
  );

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

        {/* Selected Feature */}

        <div className="rounded-xl border p-4">

          <div className="mb-3 flex items-center gap-2 font-medium">

            <Database className="h-4 w-4 text-emerald-500" />

            Selected Feature

          </div>

          <SelectedFeature />

        </div>

        {/* Coordinates */}

        <div className="rounded-xl border p-4">

          <div className="flex items-center gap-2 font-medium">

            <MapPinned className="h-4 w-4 text-sky-500" />

            Coordinates

          </div>

          <div className="mt-3 space-y-2 text-sm">

            {feature?.geometry?.type ? (
              <>
                <div>
                  Geometry:{" "}
                  <strong>{feature.geometry.type}</strong>
                </div>

                <div>
                  Layer:{" "}
                  <strong>{layer}</strong>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">
                Click a feature to view geometry.
              </div>
            )}

          </div>

        </div>

        {/* AI */}

        <div className="rounded-xl border p-4">

          <div className="flex items-center gap-2 font-medium">

            <BrainCircuit className="h-4 w-4 text-violet-500" />

            AI Insights

          </div>

          <div className="mt-3 text-sm text-muted-foreground">

            {feature
              ? "AI insights will be generated for the selected feature."
              : "Select a feature to generate AI insights."}

          </div>

        </div>

      </div>

    </aside>
  );
}