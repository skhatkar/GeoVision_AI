"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapPreview() {
  return (
    <MapContainer
      center={[31.1048, 77.1734]}
      zoom={8}
      style={{
        height: "420px",
        width: "100%",
        borderRadius: "12px",
      }}
    >
      <TileLayer
        attribution="OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}