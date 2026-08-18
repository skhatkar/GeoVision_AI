"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useMapEvents } from "react-leaflet";

interface Coordinates {
  lat: number;
  lng: number;
}

interface Props {
  onChange?: (coordinates: Coordinates) => void;
}

export default function MouseCoordinates({
  onChange,
}: Props) {
  const [coordinates, setCoordinates] =
    useState<Coordinates | null>(null);

  useMapEvents({
    mousemove: (event) => {
      const coords = {
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      };

      setCoordinates(coords);

      onChange?.(coords);
    },

    mouseout: () => {
      setCoordinates(null);
      onChange?.({
        lat: 0,
        lng: 0,
      });
    },
  });

  if (!coordinates) {
    return (
      <div
        className="
          absolute
          bottom-3
          left-3
          z-[1000]
          flex
          items-center
          gap-2
          rounded-md
          border
          border-white/20
          bg-black/80
          px-3
          py-1.5
          text-xs
          text-white
          shadow-lg
          backdrop-blur-sm
        "
      >
        <MapPin size={13} />

        <span>
          Move cursor over map
        </span>
      </div>
    );
  }

  return (
    <div
      className="
        absolute
        bottom-3
        left-3
        z-[1000]
        flex
        items-center
        gap-2
        rounded-md
        border
        border-white/20
        bg-black/80
        px-3
        py-1.5
        text-xs
        text-white
        shadow-lg
        backdrop-blur-sm
        pointer-events-none
      "
    >
      <MapPin
        size={13}
        className="text-cyan-400"
      />

      <span>
        Lat:
        {" "}
        <span className="font-mono">
          {coordinates.lat.toFixed(5)}°
        </span>
      </span>

      <span className="text-white/40">
        |
      </span>

      <span>
        Lon:
        {" "}
        <span className="font-mono">
          {coordinates.lng.toFixed(5)}°
        </span>
      </span>
    </div>
  );
}