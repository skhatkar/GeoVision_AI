"use client";

import {
  Database,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";

import type { GISLayer } from "@/types/layer";

import { useLayerStore } from "@/store/layerStore";

import LayerBadge from "./LayerBadge";

interface Props {
  layer: GISLayer;
  dragAttributes?: any;
  dragListeners?: any;
}

export default function LayerRow({
  layer,
  dragAttributes,
  dragListeners,
}: Props) {
  const toggleLayer = useLayerStore(
    (s) => s.toggleLayer
  );

  return (
    <div className="flex items-start gap-2">

      {/* Drag Handle */}
      <button
        {...dragAttributes}
        {...dragListeners}
        type="button"
        className="
          mt-1 flex h-7 w-7 shrink-0
          items-center justify-center
          rounded-md
          text-muted-foreground
          hover:bg-muted
          cursor-grab
          active:cursor-grabbing
        "
        title="Drag layer"
      >
        <GripVertical size={17} />
      </button>

      {/* Layer Color */}
      <div
        className="mt-2 h-4 w-4 shrink-0 rounded-full border"
        style={{
          backgroundColor: layer.color,
        }}
      />

      {/* Layer Information */}
      <div className="min-w-0 flex-1">

        <div className="flex items-center justify-between gap-2">

          <h3
            className="
              truncate
              font-semibold
              text-sm
            "
            title={layer.name}
          >
            {layer.name}
          </h3>

          {/* Visibility */}
          <button
            type="button"
            onClick={() =>
              toggleLayer(layer.id)
            }
            className="
              flex h-8 w-8 shrink-0
              items-center justify-center
              rounded-md
              hover:bg-muted
            "
            title={
              layer.visible
                ? "Hide layer"
                : "Show layer"
            }
          >
            {layer.visible ? (
              <Eye
                size={17}
                className="text-sky-600"
              />
            ) : (
              <EyeOff
                size={17}
                className="text-muted-foreground"
              />
            )}
          </button>

        </div>

        <div className="mt-1 flex items-center gap-2">
          <LayerBadge
            geometry={layer.geometryType}
          />
        </div>

        <div
          className="
            mt-2 flex items-center gap-2
            text-xs text-muted-foreground
          "
        >
          <Database size={13} />

          <span>
            {layer.featureCount?.toLocaleString() ?? 0}
            {" "}
            Features
          </span>
        </div>

      </div>

    </div>
  );
}