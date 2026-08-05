"use client";

import { useLayerStore } from "@/store/layerStore";
import LayerCard from "./LayerCard";

interface Props {
  search?: string;
}

export default function LayerList({
  search = "",
}: Props) {
  const layers = useLayerStore((s) => s.layers);

  const filteredLayers = layers.filter((layer) =>
    layer.name.toLowerCase().includes(search.toLowerCase())
  );

  if (filteredLayers.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
        No layers found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredLayers.map((layer) => (
        <LayerCard
          key={layer.id}
          layer={layer}
        />
      ))}
    </div>
  );
}