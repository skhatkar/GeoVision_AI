"use client";

import { useState } from "react";
import {
  Move,
  Focus,
  Download,
  Trash2,
  Palette,
} from "lucide-react";

import type { GISLayer } from "@/types/layer";
import { useLayerStore } from "@/store/layerStore";
import { useMapStore } from "@/store/mapStore";
import LayerStyleDialog from "./LayerStyleDialog";

interface Props {
  layer: GISLayer;
}

export default function LayerActions({
  layer,
}: Props) {
  const [styleOpen, setStyleOpen] = useState(false);

  const removeLayer = useLayerStore(
    (state) => state.removeLayer
  );

  const zoomToLayer = useMapStore(
    (state) => state.zoomToLayer
  );

  function downloadLayer() {
    window.open(layer.url, "_blank");
  }

  return (
    <>
      <div className="flex items-center justify-between border-t pt-2">
        {/* Style / Color */}
        <button
          onClick={() => setStyleOpen(true)}
          className="
            flex h-8 w-8
            items-center
            justify-center
            rounded-md
            text-primary
            hover:bg-primary/10
          "
          title="Style Layer & Marker"
        >
          <Palette size={16} />
        </button>

        {/* Zoom */}
        <button
          onClick={() => zoomToLayer(layer.id)}
          className="
            flex h-8 w-8
            items-center
            justify-center
            rounded-md
            text-sky-600
            hover:bg-sky-100
          "
          title="Zoom to Layer"
        >
          <Focus size={16} />
        </button>

        {/* Download */}
        <button
          onClick={downloadLayer}
          className="
            flex h-8 w-8
            items-center
            justify-center
            rounded-md
            text-green-600
            hover:bg-green-100
          "
          title="Download Layer"
        >
          <Download size={16} />
        </button>

        {/* Remove */}
        <button
          onClick={() => removeLayer(layer.id)}
          className="
            flex h-8 w-8
            items-center
            justify-center
            rounded-md
            text-red-600
            hover:bg-red-100
          "
          title="Remove Layer"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <LayerStyleDialog
        open={styleOpen}
        onClose={() => setStyleOpen(false)}
        layer={layer}
      />
    </>
  );
}