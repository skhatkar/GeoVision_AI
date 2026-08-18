"use client";

import {
  useSortable,
} from "@dnd-kit/sortable";

import {
  CSS,
} from "@dnd-kit/utilities";

import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

import type { GISLayer } from "@/types/layer";

import LayerCard from "@/components/layers/LayerCard";

interface Props {
  layer: GISLayer;
}

export default function SortableLayerRow({
  layer,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: layer.id,
  });

  const style = {
    transform:
      CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      <LayerCard
        layer={layer}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}