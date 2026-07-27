"use client";

import LayerRow from "./LayerRow";

export default function LayerPanel() {
  return (
    <aside className="w-80 border-r bg-background flex flex-col">

      <div className="border-b p-4">

        <h2 className="text-lg font-semibold">
          Layers
        </h2>

        <p className="text-sm text-muted-foreground">
          Available GIS Layers
        </p>

      </div>

      <div className="flex-1 space-y-2 overflow-auto p-4">

        <LayerRow
          name="District Boundary"
          visible={true}
          color="#3b82f6"
        />

        <LayerRow
          name="Panchayat Boundary"
          visible={true}
          color="#22c55e"
        />

        <LayerRow
          name="Village Boundary"
          visible={false}
          color="#f59e0b"
        />

        <LayerRow
          name="Road Network"
          visible={true}
          color="#ef4444"
        />

        <LayerRow
          name="Health Facilities"
          visible={false}
          color="#8b5cf6"
        />

        <LayerRow
          name="Government Assets"
          visible={true}
          color="#06b6d4"
        />

      </div>

    </aside>
  );
}