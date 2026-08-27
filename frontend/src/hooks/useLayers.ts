"use client";

import { useEffect } from "react";
import { getLayerGeoJsonUrl, getLayers } from "@/api/layerApi";
import { useLayerStore } from "@/store/layerStore";

const PALETTE = [
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

export default function useLayers() {
  const setLayers = useLayerStore((state) => state.setLayers);

  useEffect(() => {
    async function loadLayers() {
      try {
        const backendLayers = await getLayers();
        const existingLayers = useLayerStore.getState().layers;
        const existingMap = new Map(existingLayers.map((l) => [l.id, l]));

        const layers = backendLayers.map((layer, index) => {
          const existing = existingMap.get(String(layer.id));
          return {
            // Basic
            id: String(layer.id),
            name: layer.name,
            type: "geojson" as const,
            url: getLayerGeoJsonUrl(layer.id),

            // Display & Custom Styles
            visible: existing ? existing.visible : index === 0,
            opacity: existing?.opacity ?? 1,
            color: existing?.color ?? PALETTE[index % PALETTE.length],
            fillColor: existing?.fillColor ?? existing?.color ?? PALETTE[index % PALETTE.length],
            icon: existing?.icon,
            customIcon: existing?.customIcon,
            pointSize: existing?.pointSize ?? 28,
            weight: existing?.weight ?? 2,

            // GIS Information
            geometryType: layer.geometry_type,
            featureCount: layer.feature_count,
            crs: layer.crs,

            // Backend Metadata
            datasetId: layer.dataset_id,
            departmentId: layer.department_id,
            projectId: layer.project_id,
            projectName: layer.project_name,
            filePath: layer.file_path,
            createdAt: layer.created_at,
            updatedAt: layer.updated_at,
          };
        });

        setLayers(layers);
      } catch (err) {
        console.error("Failed to load map layers:", err);
      }
    }

    loadLayers();
  }, [setLayers]);
}
