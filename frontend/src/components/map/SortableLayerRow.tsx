"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import LayerRow from "./LayerRow";
import type { GISLayer } from "@/types/layer";

interface Props {
  layer: GISLayer;
}

export default function SortableLayerRow({ layer }: Props) {
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
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-3 rounded-xl border bg-card p-3 shadow-sm"
    >
      <div className="mb-2 flex items-center gap-2">

        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex-1">
          <LayerRow layer={layer} />
        </div>

      </div>
    </div>
  );
}