"use client";

import { useEffect } from "react";

import { getLayerGeoJsonUrl, getLayers } from "@/api/layerApi";
import { useLayerStore } from "@/store/layerStore";

export default function useLayers() {
  const setLayers = useLayerStore((state) => state.setLayers);

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
          "#9333EA",
          "#16A34A",
          "#EA580C",
        ];

        const layers = backendLayers.map((layer, index) => ({
          // Basic
          id: String(layer.id),

          name: layer.name,

          type: "geojson" as const,

          url: getLayerGeoJsonUrl(layer.id),

          // Display
          visible: index === 0,

          opacity: 1,

          color: colors[index % colors.length],

          fillColor: colors[index % colors.length],

          weight: 2,

          // GIS Information
          geometryType: layer.geometry_type,

          featureCount: layer.feature_count,

          crs: layer.crs,

          // Backend Metadata
          datasetId: layer.dataset_id,

          departmentId: layer.department_id,

          filePath: layer.file_path,

          createdAt: layer.created_at,

          updatedAt: layer.updated_at,
        }));

        setLayers(layers);

      } catch (err) {
        console.error("Failed to load map layers:", err);

      }
    }

    loadLayers();

  }, [setLayers]);
}
