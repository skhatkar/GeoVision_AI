"use client";

import {
  Info,
  MapPinned,
  Database,
  BrainCircuit,
} from "lucide-react";

export default function RightPanel() {
  return (
    <aside className="w-80 border-l bg-background flex flex-col">

      {/* Header */}

      <div className="border-b p-4">

        <h2 className="flex items-center gap-2 text-lg font-semibold">

          <Info className="h-5 w-5 text-sky-500" />

          Information

        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          Selected Feature Details
        </p>

      </div>

      {/* Content */}

      <div className="flex-1 space-y-6 overflow-auto p-4">

        {/* Coordinates */}

        <div className="rounded-xl border p-4">

          <div className="flex items-center gap-2 font-medium">

            <MapPinned className="h-4 w-4 text-sky-500" />

            Coordinates

          </div>

          <div className="mt-3 space-y-2 text-sm">

            <div>Latitude : 31.1048</div>

            <div>Longitude : 77.1734</div>

            <div>Elevation : 2205 m</div>

          </div>

        </div>

        {/* Layer */}

        <div className="rounded-xl border p-4">

          <div className="flex items-center gap-2 font-medium">

            <Database className="h-4 w-4 text-emerald-500" />

            Active Layer

          </div>

          <div className="mt-3 text-sm">

            District Boundary

          </div>

        </div>

        {/* AI */}

        <div className="rounded-xl border p-4">

          <div className="flex items-center gap-2 font-medium">

            <BrainCircuit className="h-4 w-4 text-violet-500" />

            AI Insights

          </div>

          <div className="mt-3 text-sm text-muted-foreground">

            Select an asset or feature to view AI-generated insights.

          </div>

        </div>

      </div>

    </aside>
  );
}