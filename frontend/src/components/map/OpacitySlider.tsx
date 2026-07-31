"use client";

import { useLayerStore } from "@/store/layerStore";

interface Props {
  id: string;
  opacity: number;
}

export default function OpacitySlider({
  id,
  opacity,
}: Props) {
  const setOpacity = useLayerStore((s) => s.setOpacity);

  return (
    <input
      type="range"
      min={0}
      max={1}
      step={0.05}
      value={opacity}
      onChange={(e) =>
        setOpacity(id, Number(e.target.value))
      }
      className="w-full"
    />
  );
}