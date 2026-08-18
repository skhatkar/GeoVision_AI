"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useLayerStore } from "@/store/layerStore";

import SortableLayerRow from "@/components/map/SortableLayerRow";

interface Props {
  search?: string;
}

export default function LayerList({
  search = "",
}: Props) {
  const layers = useLayerStore(
    (state) => state.layers
  );

  const moveLayer = useLayerStore(
    (state) => state.moveLayer
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const filteredLayers = layers.filter((layer) =>
    layer.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function handleDragEnd(
    event: DragEndEvent
  ) {
    const { active, over } = event;

    if (!over) return;

    if (active.id === over.id) {
      return;
    }

    const oldIndex = layers.findIndex(
      (layer) => layer.id === active.id
    );

    const newIndex = layers.findIndex(
      (layer) => layer.id === over.id
    );

    if (
      oldIndex === -1 ||
      newIndex === -1
    ) {
      return;
    }

    moveLayer(oldIndex, newIndex);
  }

  if (filteredLayers.length === 0) {
    return (
      <div
        className="
          rounded-lg
          border
          p-4
          text-center
          text-sm
          text-muted-foreground
        "
      >
        No layers found
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={filteredLayers.map(
          (layer) => layer.id
        )}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">

          {filteredLayers.map((layer) => (
            <SortableLayerRow
              key={layer.id}
              layer={layer}
            />
          ))}

        </div>
      </SortableContext>
    </DndContext>
  );
}