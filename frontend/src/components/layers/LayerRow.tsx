"use client";

import {
  Database,
  Map,
  MapPinned,
  Square,
  Pentagon,
} from "lucide-react";

import { GISLayer } from "@/types/layer";
import LayerToggle from "./LayerToggle";
import LayerBadge from "./LayerBadge";

interface Props {
  layer: GISLayer;
}

function getLayerIcon(type: string) {
  switch (type.toLowerCase()) {
    case "point":
      return <MapPinned size={18} className="text-red-500" />;

    case "polygon":
      return <Square size={18} className="text-green-600" />;

    case "line":
    case "linestring":
      return <Pentagon size={18} className="text-orange-500" />;

    default:
      return <Map size={18} className="text-sky-600" />;
  }
}

export default function LayerRow({
  layer,
}: Props) {
  return (
    <div className="flex justify-between gap-3">

      <div className="flex gap-3 flex-1">

        <div
          className="rounded-lg p-2"
          style={{
            backgroundColor:
              layer.fillColor ??
              layer.color ??
              "#E0F2FE",
          }}
        >
          {getLayerIcon(layer.type)}
        </div>

        <div className="flex-1 min-w-0">

          <div className="font-medium truncate">
            {layer.name}
          </div>

          <div className="flex gap-2 mt-1 items-center">

            <LayerBadge layer={layer} />

            <span className="text-xs text-muted-foreground flex items-center gap-1">

              <Database size={12} />

              {layer.type}

            </span>

          </div>

        </div>

      </div>

      <LayerToggle layer={layer} />

    </div>
  );
}