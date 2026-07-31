"use client";

import { Eye, EyeOff } from "lucide-react";

import { GISLayer } from "@/types/layer";
import { useLayerStore } from "@/store/layerStore";

interface Props {
  layer: GISLayer;
}

export default function LayerRow({ layer }: Props) {
  const toggleLayer = useLayerStore((s) => s.toggleLayer);

  return (
    <div className="group flex items-center justify-between rounded-lg border bg-card px-3 py-2 hover:bg-muted transition">

      <div className="flex items-center gap-3">

        <div
          className="h-4 w-4 rounded border"
          style={{
            background: layer.color,
          }}
        />

        <span className="text-sm font-medium">
          {layer.name}
        </span>

      </div>

      <button
        onClick={() => toggleLayer(layer.id)}
        className="text-muted-foreground hover:text-primary transition"
      >
        {layer.visible ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>

    </div>
  );
}