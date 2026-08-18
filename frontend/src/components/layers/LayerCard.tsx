"use client";

import type { GISLayer } from "@/types/layer";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

import LayerLegend from "./LayerLegend";
import LayerInfo from "./LayerInfo";
import LayerOpacity from "./LayerOpacity";
import LayerActions from "./LayerActions";
import LayerVisibility from "./LayerVisibility";

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
  return (
    <div
      className="
        rounded-xl
        border
        bg-card
        p-4
        shadow-sm
        transition
        hover:shadow-md
      "
    >
      {/* Header */}

      <div className="flex items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          {/* Drag Handle */}

          <button
            type="button"
            {...dragAttributes}
            {...dragListeners}
            className="
              flex
              h-8
              w-8
              shrink-0
              cursor-grab
              items-center
              justify-center
              rounded-md
              text-muted-foreground
              hover:bg-muted
              active:cursor-grabbing
            "
            title="Drag layer"
          >
            <span className="text-lg leading-none">
              ⋮⋮
            </span>
          </button>

          {/* Layer Symbol */}

          <LayerLegend
            geometryType={layer.geometryType}
            color={layer.color}
          />

          {/* Layer Name */}

          <div className="min-w-0">

            <div
              className="
                truncate
                text-sm
                font-semibold
              "
              title={layer.name}
            >
              {layer.name}
            </div>

            <div className="mt-0.5 text-xs text-muted-foreground">
              {layer.geometryType ?? "Unknown geometry"}
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

      <div className="mt-3">
        <LayerInfo layer={layer} />
      </div>

      {/* Opacity */}

      <div className="mt-3">
        <LayerOpacity layer={layer} />
      </div>

      {/* Actions */}

      <div className="mt-3">
        <LayerActions layer={layer} />
      </div>

    </div>
  );
}