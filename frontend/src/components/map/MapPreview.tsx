"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer } from "react-leaflet";

import { useMapStore } from "@/store/mapStore";
import { BASEMAPS } from "@/constants/basemaps";

export default function MapPreview() {

  const basemap = useMapStore((state) => state.basemap);

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

    </MapContainer>

  );
}
