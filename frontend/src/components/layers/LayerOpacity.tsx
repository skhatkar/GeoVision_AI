"use client";

import { GISLayer } from "@/types/layer";
import { useLayerStore } from "@/store/layerStore";

interface Props {
  layer: GISLayer;
}

export default function LayerOpacity({
  layer,
}: Props) {
  const setOpacity = useLayerStore(
    (state) => state.setOpacity
  );

  return (
    <div className="space-y-2">

      <div className="flex justify-between text-xs text-muted-foreground">

        <span>Opacity</span>

        <span>{Math.round(layer.opacity * 100)}%</span>

      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={layer.opacity * 100}
        onChange={(e) =>
          setOpacity(
            layer.id,
            Number(e.target.value) / 100
          )
        }
        className="w-full"
        style={{
          accentColor: layer.color,
        }}
      />

    </div>
  );
}