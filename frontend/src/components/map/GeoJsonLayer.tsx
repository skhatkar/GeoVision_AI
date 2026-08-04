"use client";

import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";

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
        console.log("Fetching GeoJSON:", layer.url);

        const res = await fetch(layer.url);

        console.log("Status:", res.status);

        if (!res.ok) {
          const text = await res.text();
          console.error("Backend Response:", text);
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();

        console.log("GeoJSON Loaded:", json);

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

      pointToLayer={(feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 7,
          fillColor: layer.color,
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        })
      }

      style={() => ({
        color: layer.color,
        weight: layer.weight,
        opacity: layer.opacity,
        fillColor: layer.color,
        fillOpacity: 0.15,
      })}

      onEachFeature={(feature, leafletLayer) => {

        if (feature.properties) {

          let html = "";

          Object.entries(feature.properties).forEach(([key, value]) => {
            html += `<b>${key}</b>: ${String(value)}<br/>`;
          });

          leafletLayer.bindPopup(html);

        }

        leafletLayer.on({

          click: () => {

            const previous =
              useSelectionStore.getState().selectedLeafletLayer;

            if (
              previous &&
              previous !== leafletLayer &&
              "setStyle" in previous
            ) {
              previous.setStyle({
                color: layer.color,
                weight: layer.weight,
                opacity: layer.opacity,
                fillColor: layer.color,
                fillOpacity: 0.15,
              });
            }

            setSelection(
              layer.name,
              feature,
              leafletLayer
            );

            if ("setStyle" in leafletLayer) {
              leafletLayer.setStyle({
                color: "#FFD700",
                weight: 5,
                opacity: 1,
                fillColor: layer.color,
                fillOpacity: 0.45,
              });
            }

            if ("bringToFront" in leafletLayer) {
              leafletLayer.bringToFront();
            }

          },

          mouseover: () => {

            if ("setStyle" in leafletLayer) {
              leafletLayer.setStyle({
                weight: (layer.weight ?? 2) + 1,
              });
            }

          },

          mouseout: () => {

            const selected =
              useSelectionStore.getState().selectedLeafletLayer;

            if (selected === leafletLayer) return;

            if ("setStyle" in leafletLayer) {
              leafletLayer.setStyle({
                color: layer.color,
                weight: layer.weight,
                opacity: layer.opacity,
                fillColor: layer.color,
                fillOpacity: 0.15,
              });
            }

          },

        });

      }}
    />
  );
}