"use client";

import { Database, Globe, Shapes } from "lucide-react";

import type { GISLayer } from "@/types/layer";

interface Props {
  layer: GISLayer;
}

export default function LayerInfo({
  layer,
}: Props) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">

      <div className="flex items-center gap-1">
        <Shapes size={13} />
        {layer.geometryType}
      </div>

      <div>
        {layer.featureCount} Features
      </div>

      <div className="flex items-center gap-1">
        <Globe size={13} />
        {layer.crs}
      </div>

      <div className="flex items-center gap-1">
        <Database size={13} />
        #{layer.datasetId}
      </div>

    </div>
  );
}