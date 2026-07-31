"use client";

import { Database } from "lucide-react";
import { useSelectionStore } from "@/store/selectionStore";

export default function SelectedFeature() {
  const feature = useSelectionStore((s) => s.selectedFeature);
  const layer = useSelectionStore((s) => s.selectedLayer);

  if (!feature) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <Database className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

        <p className="font-medium">
          No Feature Selected
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Click any district, tehsil or asset on the map.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold">
          Selected Feature
        </h3>

        <p className="text-xs text-muted-foreground">
          {layer}
        </p>
      </div>

      <div className="rounded-lg border bg-card p-3">
        {Object.entries(feature.properties ?? {}).map(([key, value]) => (
          <div
            key={key}
            className="flex justify-between border-b py-1 text-sm"
          >
            <span className="font-medium">
              {key}
            </span>

            <span className="text-right">
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}