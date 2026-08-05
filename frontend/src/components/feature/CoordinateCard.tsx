"use client";

import { MapPin, Copy } from "lucide-react";

interface Props {
  centroid: [number, number] | null;
}

export default function CoordinateCard({
  centroid,
}: Props) {
  if (!centroid) return null;

  const [lat, lng] = centroid;

  const copyCoordinates = async () => {
    await navigator.clipboard.writeText(
      `${lat}, ${lng}`
    );

    alert("Coordinates copied.");
  };

  return (
    <div className="rounded-xl border bg-card p-4">

      <div className="mb-3 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <MapPin
            className="text-red-500"
            size={18}
          />

          <h3 className="font-semibold">
            Coordinates
          </h3>

        </div>

        <button
          onClick={copyCoordinates}
          className="rounded p-1 hover:bg-muted"
        >
          <Copy size={16} />
        </button>

      </div>

      <div className="space-y-2 text-sm">

        <div className="flex justify-between">

          <span>Latitude</span>

          <span>{lat.toFixed(6)}</span>

        </div>

        <div className="flex justify-between">

          <span>Longitude</span>

          <span>{lng.toFixed(6)}</span>

        </div>

      </div>

    </div>
  );
}