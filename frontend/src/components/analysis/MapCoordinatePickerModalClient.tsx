"use client";

import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle2, X } from "lucide-react";

// Fix default Leaflet marker icon URLs
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface Props {
  initialLat?: number;
  initialLng?: number;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function MapCoordinatePickerModalClient({
  initialLat = 31.1048,
  initialLng = 77.1734,
  onConfirm,
  onClose,
}: Props) {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden flex flex-col space-y-3 p-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              📍
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Interactive Spatial Coordinate Picker</h3>
              <p className="text-[11px] text-muted-foreground">
                Click anywhere on the map to select coordinates for your spatial analysis query.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Leaflet Picker Map */}
        <div className="relative w-full h-[380px] rounded-xl overflow-hidden border border-border/70 shadow-inner bg-slate-950">
          <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={9}
            zoomControl={false}
            className="h-full w-full z-0 cursor-crosshair"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onSelect={(lat, lng) => setCoords({ lat, lng })} />
            <Marker
              position={[coords.lat, coords.lng]}
              icon={customIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  setCoords({ lat: pos.lat, lng: pos.lng });
                },
              }}
            >
              <Popup>
                <div className="font-mono text-xs p-1">
                  <strong>Selected Location</strong>
                  <br />
                  Lat: {coords.lat.toFixed(5)}
                  <br />
                  Lng: {coords.lng.toFixed(5)}
                </div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Floating Coordinate Badge */}
          <div className="absolute top-3 left-3 z-[400] rounded-xl bg-slate-900/90 backdrop-blur-md px-3.5 py-2 border border-slate-700/70 shadow-lg text-xs space-y-0.5">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Selected GPS Coordinates</p>
            <p className="font-mono font-bold text-cyan-400">
              Latitude: {coords.lat.toFixed(5)}°
            </p>
            <p className="font-mono font-bold text-emerald-400">
              Longitude: {coords.lng.toFixed(5)}°
            </p>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-muted-foreground">
            💡 Tip: You can drag the blue pin to fine-tune your target coordinates.
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onConfirm(coords.lat, coords.lng);
                onClose();
              }}
              className="gap-1.5 text-xs font-semibold cursor-pointer shadow-md shadow-primary/20"
            >
              <CheckCircle2 size={14} />
              <span>Use Selected Coordinates</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
