"use client";

import {
  Database,
  FolderOpen,
  Globe,
  Shapes,
} from "lucide-react";

import { GISLayer } from "@/types/layer";

interface Props {
  layer: GISLayer;
}

export default function LayerDetails({
  layer,
}: Props) {
  return (
    <div className="mt-3 rounded-lg border bg-muted/30 p-3">

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">

        <div className="flex items-center gap-2">
          <Shapes size={15} className="text-sky-600" />
          <span className="text-muted-foreground">
            Geometry
          </span>
        </div>

        <div className="font-medium">
          {layer.geometryType ?? "-"}
        </div>

        <div className="flex items-center gap-2">
          <Database size={15} className="text-green-600" />
          <span className="text-muted-foreground">
            Features
          </span>
        </div>

        <div className="font-medium">
          {layer.featureCount?.toLocaleString() ?? 0}
        </div>

        <div className="flex items-center gap-2">
          <Globe size={15} className="text-orange-500" />
          <span className="text-muted-foreground">
            CRS
          </span>
        </div>

        <div className="font-medium">
          {layer.crs ?? "Unknown"}
        </div>

        <div className="flex items-center gap-2">
          <FolderOpen size={15} className="text-purple-600" />
          <span className="text-muted-foreground">
            Dataset
          </span>
        </div>

        <div className="font-medium">
          #{layer.datasetId ?? "-"}
        </div>

      </div>

    </div>
  );
}