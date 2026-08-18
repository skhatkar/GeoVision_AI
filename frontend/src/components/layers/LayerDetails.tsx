"use client";

import { Database, FolderOpen, Globe, Shapes } from "lucide-react";
import { GISLayer } from "@/types/layer";

interface Props {
  layer: GISLayer;
}

export default function LayerDetails({ layer }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3 text-sm">

      <div className="flex items-center gap-2">
        <Shapes size={15}/>
        Geometry
      </div>

      <div>{layer.geometryType}</div>

      <div className="flex items-center gap-2">
        <Database size={15}/>
        Features
      </div>

      <div>
        {layer.featureCount?.toLocaleString()}
      </div>

      <div className="flex items-center gap-2">
        <Globe size={15}/>
        CRS
      </div>

      <div>{layer.crs}</div>

      <div className="flex items-center gap-2">
        <FolderOpen size={15}/>
        Dataset
      </div>

      <div>#{layer.datasetId}</div>

    </div>
  );
}