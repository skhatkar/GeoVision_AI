"use client";

import { useState } from "react";
import {
  Database,
  Eye,
  EyeOff,
  GripVertical,
  Palette,
} from "lucide-react";

import type { GISLayer } from "@/types/layer";
import { useLayerStore } from "@/store/layerStore";
import LayerBadge from "./LayerBadge";
import LayerStyleDialog from "./LayerStyleDialog";
import LayerIconBadge from "./LayerIconBadge";

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
  const toggleLayer = useLayerStore((s) => s.toggleLayer);
  const [styleOpen, setStyleOpen] = useState(false);

  return (
    <>
      <div className="group flex items-start gap-2.5">
        {/* Drag Handle */}
        <button
          {...dragAttributes}
          {...dragListeners}
          type="button"
          className="
            mt-0.5 flex h-7 w-6 shrink-0
            items-center justify-center
            rounded-md
            text-muted-foreground
            hover:bg-muted
            cursor-grab
            active:cursor-grabbing
          "
          title="Drag to reorder layer"
        >
          <GripVertical size={16} />
        </button>

        {/* Dynamic Layer Icon Badge (Uploaded Icon / Symbol / Swatch) */}
        <div className="mt-0.5">
          <LayerIconBadge
            layer={layer}
            size="sm"
            onClick={() => setStyleOpen(true)}
            className="cursor-pointer"
          />
        </div>

        {/* Layer Information */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3
              className="truncate font-semibold text-sm cursor-pointer hover:text-primary transition-colors leading-tight"
              title={layer.name}
              onClick={() => setStyleOpen(true)}
            >
              {layer.name}
            </h3>

            <div className="flex items-center gap-0.5">
              {/* Style Editor Button */}
              <button
                type="button"
                onClick={() => setStyleOpen(true)}
                className="
                  flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground
                  opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all cursor-pointer
                "
                title="Customize color, symbol & uploaded icon"
              >
                <Palette size={14} />
              </button>

              {/* Visibility */}
              <button
                type="button"
                onClick={() => toggleLayer(layer.id)}
                className="
                  flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-muted cursor-pointer
                "
                title={layer.visible ? "Hide layer" : "Show layer"}
              >
                {layer.visible ? (
                  <Eye size={16} className="text-sky-600" />
                ) : (
                  <EyeOff size={16} className="text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <LayerBadge geometry={layer.geometryType} />
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Database size={12} />
            <span>
              {layer.featureCount?.toLocaleString() ?? 0} Features
            </span>
          </div>
        </div>
      </div>

      {/* Style Dialog */}
      <LayerStyleDialog
        open={styleOpen}
        onClose={() => setStyleOpen(false)}
        layer={layer}
      />
    </>
  );
}