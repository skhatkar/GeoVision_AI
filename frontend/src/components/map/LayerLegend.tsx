"use client";

import { GISLayer } from "@/types/layer";

interface Props {
  layer: GISLayer;
}

export default function LayerLegend({
  layer,
}: Props) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">

      <div
        className="h-3 w-6 rounded"
        style={{
          background: layer.color,
        }}
      />

      <span>{layer.name}</span>

    </div>
  );
}