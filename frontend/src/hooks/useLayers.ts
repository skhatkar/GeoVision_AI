"use client";

import { useEffect } from "react";

import { getLayers } from "@/services/layers";
import { useLayerStore } from "@/store/layerStore";


export default function useLayers() {
  const setLayers = useLayerStore((s) => s.setLayers);

  useEffect(() => {
    async function loadLayers() {
      try {
        const backendLayers = await getLayers();

        const colors = [
          "#2563EB",
          "#10B981",
          "#F97316",
          "#8B5CF6",
          "#DC2626",
          "#0891B2",
          "#CA8A04",
        ];

        const layers = backendLayers.map((layer, index) => ({
          id: String(layer.id),

          name: layer.name,

          type: "geojson",

          url: `http://127.0.0.1:8000/geojson/layer/${layer.id}`,

          visible: index === 0,

          opacity: 1,

          color: colors[index % colors.length],

          fillColor: colors[index % colors.length],

          weight: 2,
        }));

        setLayers(layers);

        console.log("Layers Loaded:", layers);
      } catch (err) {
        console.error(err);
      }
    }

    loadLayers();
  }, [setLayers]);
}