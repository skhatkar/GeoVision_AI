"use client";

import { GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";
import { GISLayer } from "@/types/layer";

interface Props {
  layer: GISLayer;
}

export default function GeoJsonLayer({ layer }: Props) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!layer.visible) return;

    fetch(layer.url)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [layer]);

  if (!layer.visible || !data) return null;

  return (
    <GeoJSON
      data={data}
      style={{
        color: layer.color,
        weight: layer.weight,
        opacity: layer.opacity,
        fillOpacity: layer.opacity * 0.25,
      }}
    />
  );
}