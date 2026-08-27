"use client";

import { useState } from "react";
import type { GISLayer } from "@/types/layer";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

import LayerIconBadge from "./LayerIconBadge";
import LayerInfo from "./LayerInfo";
import LayerOpacity from "./LayerOpacity";
import LayerActions from "./LayerActions";
import LayerVisibility from "./LayerVisibility";
import LayerStyleDialog from "./LayerStyleDialog";

interface Props {
  layer: GISLayer;
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
}

export default function LayerCard({
  layer,
  dragAttributes,
  dragListeners,
}: Props) {
  const [styleOpen, setStyleOpen] = useState(false);

  return (
    <>
      <div
        className="
          rounded-xl
          border
          bg-card
          p-3.5
          shadow-xs
          transition-all
          hover:shadow-md
          hover:border-primary/30
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* Drag Handle */}
            <button
              type="button"
              {...dragAttributes}
              {...dragListeners}
              className="
                flex
                h-7
                w-5
                shrink-0
                cursor-grab
                items-center
                justify-center
                rounded-md
                text-muted-foreground
                hover:bg-muted
                active:cursor-grabbing
              "
              title="Drag layer to reorder"
            >
              <span className="text-base leading-none">⋮⋮</span>
            </button>

            {/* Dynamic Layer Icon Badge */}
            <LayerIconBadge
              layer={layer}
              size="sm"
              onClick={() => setStyleOpen(true)}
              className="cursor-pointer"
            />

            {/* Layer Name */}
            <div className="min-w-0 flex-1">
              <div
                className="
                  truncate
                  text-sm
                  font-semibold
                  cursor-pointer
                  hover:text-primary
                  transition-colors
                "
                title={`${layer.name} (Click to style)`}
                onClick={() => setStyleOpen(true)}
              >
                {layer.name}
              </div>

              <div className="mt-0.5 text-xs text-muted-foreground truncate">
                {layer.geometryType ?? "GIS Layer"}
              </div>
            </div>
          </div>

          {/* Visibility */}
          <LayerVisibility
            layerId={layer.id}
            visible={layer.visible}
          />
        </div>

        {/* Layer Information */}
        <div className="mt-2.5">
          <LayerInfo layer={layer} />
        </div>

        {/* Opacity */}
        <div className="mt-2.5">
          <LayerOpacity layer={layer} />
        </div>

        {/* Actions */}
        <div className="mt-2.5">
          <LayerActions layer={layer} />
        </div>
      </div>

      {/* Layer Style Dialog */}
      <LayerStyleDialog
        open={styleOpen}
        onClose={() => setStyleOpen(false)}
        layer={layer}
      />
    </>
  );
}