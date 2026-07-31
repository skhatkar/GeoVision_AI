"use client";

import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

import type { GISLayer } from "@/types/layer";
import { useSelectionStore } from "@/store/selectionStore";

interface Props {
  layer: GISLayer;
}

export default function GeoJsonLayer({ layer }: Props) {
  const [data, setData] = useState<any>(null);

  const setSelection = useSelectionStore(
    (state) => state.setSelection
  );

  useEffect(() => {
    async function loadLayer() {
      try {
        const res = await fetch(layer.url);
        const json = await res.json();

        setData(json);
      } catch (err) {
        console.error("Failed to load:", layer.url, err);
      }
    }

    loadLayer();
  }, [layer.url]);

  if (!data) return null;

  return (
    <GeoJSON
      data={data}
      style={() => ({
        color: layer.color,
        weight: layer.weight,
        opacity: layer.opacity,
        fillColor: layer.color,
        fillOpacity: 0.15,
      })}
      onEachFeature={(feature, leafletLayer) => {
        // Popup
        if (feature.properties) {
          let html = "";

          Object.entries(feature.properties).forEach(([key, value]) => {
            html += `<b>${key}</b>: ${String(value)}<br/>`;
          });

          leafletLayer.bindPopup(html);
        }

        // Events
        leafletLayer.on({
          click: () => {
            // Save selected feature
            setSelection(layer.name, feature);

            // Highlight selected feature
            leafletLayer.setStyle({
              color: "#FFD700",
              weight: 5,
              opacity: 1,
              fillColor: layer.color,
              fillOpacity: 0.45,
            });

            // Bring selected feature above others
            if ("bringToFront" in leafletLayer) {
              leafletLayer.bringToFront();
            }
          },

          mouseover: () => {
            leafletLayer.setStyle({
              weight: (layer.weight ?? 2) + 1,
            });
          },

          mouseout: () => {
            leafletLayer.setStyle({
              color: layer.color,
              weight: layer.weight,
              opacity: layer.opacity,
              fillColor: layer.color,
              fillOpacity: 0.15,
            });
          },
        });
      }}
    />
  );
}