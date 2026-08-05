"use client";

import {
  Eye,
  EyeOff,
} from "lucide-react";

import { GISLayer } from "@/types/layer";
import { useLayerStore } from "@/store/layerStore";

interface Props {
  layer: GISLayer;
}

export default function LayerToggle({
  layer,
}: Props) {

  const toggleLayer =
    useLayerStore(
      (s) => s.toggleLayer
    );

  return (
    <button
      onClick={() =>
        toggleLayer(layer.id)
      }
      className="rounded-lg p-2 hover:bg-muted transition"
    >
      {layer.visible ? (
        <Eye
          size={18}
          className="text-sky-600"
        />
      ) : (
        <EyeOff
          size={18}
          className="text-muted-foreground"
        />
      )}
    </button>
  );
}