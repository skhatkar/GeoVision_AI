"use client";

import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  TileLayer,
} from "react-leaflet";

import { useMapStore } from "@/store/mapStore";
import { BASEMAPS } from "@/constants/basemaps";

import { useLayerStore } from "@/store/layerStore";
import GeoJsonLayer from "./GeoJsonLayer";

export default function MapPreview() {
  const basemap = useMapStore((state) => state.basemap);

  const layers = useLayerStore((state) => state.layers);

  return (
    <MapContainer
      center={[31.1048, 77.1734]}
      zoom={8}
      className="h-full w-full"
    >
      <TileLayer
        attribution={BASEMAPS[basemap].name}
        url={BASEMAPS[basemap].url}
      />

      {layers
        .filter((layer) => layer.visible)
        .map((layer) => (
          <GeoJsonLayer
            key={layer.id}
            layer={layer}
          />
        ))}
    </MapContainer>
  );
}