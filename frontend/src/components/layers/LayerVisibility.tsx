"use client";

import { Eye, EyeOff } from "lucide-react";

import { useLayerStore } from "@/store/layerStore";

interface Props {
  layerId: string;
  visible: boolean;
}

export default function LayerVisibility({
  layerId,
  visible,
}: Props) {
  const toggleLayer = useLayerStore(
    (state) => state.toggleLayer
  );

  return (
    <button
      onClick={() => toggleLayer(layerId)}
      className="
        flex h-8 w-8 items-center justify-center
        rounded-md
        hover:bg-muted
        transition
      "
      title={visible ? "Hide Layer" : "Show Layer"}
    >
      {visible ? (
        <Eye
          size={18}
          className="text-emerald-500"
        />
      ) : (
        <EyeOff
          size={18}
          className="text-muted-foreground"
        />
      )}
    </button>
  );
}