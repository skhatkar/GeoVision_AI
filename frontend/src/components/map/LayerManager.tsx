"use client";

import { useLayerStore } from "@/store/layerStore";
import LayerItem from "./LayerItem";

export default function LayerManager() {

  const { layers, toggleLayer } = useLayerStore();

  return (
    <div className="space-y-3">

      {layers.map((layer) => (
        <LayerItem
          key={layer.id}
          name={layer.name}
          visible={layer.visible}
          onToggle={() => toggleLayer(layer.id)}
        />
      ))}

    </div>
  );
}