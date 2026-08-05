"use client";

import { useEffect, useRef, useState } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";
import type { GeoJSON as LeafletGeoJSON } from "leaflet";

import type { GISLayer } from "@/types/layer";
import { useSelectionStore } from "@/store/selectionStore";
import { useMapStore } from "@/store/mapStore";
import { useTableStore } from "@/store/tableStore";

interface Props {
  layer: GISLayer;
}

export default function GeoJsonLayer({ layer }: Props) {
  const [data, setData] = useState<any>(null);

  const geoJsonRef = useRef<LeafletGeoJSON | null>(null);

  const setSelection = useSelectionStore(
    (state) => state.setSelection
  );

  const registerLayer = useMapStore(
    (state) => state.registerLayer
  );

  const unregisterLayer = useMapStore(
    (state) => state.unregisterLayer
  );

  const selectedAssetId =
  useTableStore(
    (s) => s.selectedAssetId
  );

  useEffect(() => {
    async function loadLayer() {
      try {
        console.log("Fetching GeoJSON:", layer.url);

        const res = await fetch(layer.url);

        if (!res.ok) {
          const text = await res.text();
          console.error(text);
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();

        console.log("Loaded:", json);

        setData(json);
      } catch (err) {
        console.error(err);
      }
    }

    loadLayer();
  }, [layer.url]);

  useEffect(() => {
    if (geoJsonRef.current) {
      registerLayer(layer.id, geoJsonRef.current);
    }

    return () => {
      unregisterLayer(layer.id);
    };
  }, [
    layer.id,
    registerLayer,
    unregisterLayer,
    data,
  ]);

  if (!data) return null;

  return (
    <GeoJSON
      ref={geoJsonRef}
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
        // ---------------- Popup ----------------

        if (feature.properties) {
          let html = "";

          Object.entries(feature.properties).forEach(
            ([key, value]) => {
              html += `<b>${key}</b>: ${String(value)}<br/>`;
            }
          );

          leafletLayer.bindPopup(html);
        }

        // ---------------- Events ----------------

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
            if (
              "setStyle" in leafletLayer &&
              useSelectionStore.getState().selectedLeafletLayer !==
                leafletLayer
            ) {
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