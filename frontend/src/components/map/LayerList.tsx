"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useLayerStore } from "@/store/layerStore";

import SortableLayerRow from "./SortableLayerRow";
import OpacitySlider from "./OpacitySlider";
import LayerLegend from "./LayerLegend";

interface Props {
  search: string;
}

export default function LayerList({ search }: Props) {
  const layers = useLayerStore((state) => state.layers);
  const moveLayer = useLayerStore((state) => state.moveLayer);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const filteredLayers = layers.filter((layer) =>
    layer.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = layers.findIndex((l) => l.id === active.id);
    const newIndex = layers.findIndex((l) => l.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      moveLayer(oldIndex, newIndex);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={filteredLayers.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {filteredLayers.map((layer) => (
            <div
              key={layer.id}
              className="rounded-xl border bg-card p-3 shadow-sm"
            >
              {/* Drag + Visibility Row */}
              <SortableLayerRow layer={layer} />

              {/* Opacity */}
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Opacity</span>
                  <span>{Math.round(layer.opacity * 100)}%</span>
                </div>

                <OpacitySlider
                  id={layer.id}
                  opacity={layer.opacity}
                />
              </div>

              {/* Legend */}
              <div className="mt-3">
                <LayerLegend layer={layer} />
              </div>
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}