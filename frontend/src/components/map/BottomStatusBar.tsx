"use client";

import {
  MapPinned,
  MousePointer2,
  Globe,
  Gauge,
  Layers3,
} from "lucide-react";

import { useMapStore } from "@/store/mapStore";
import { useLayerStore } from "@/store/layerStore";
import { useEffect, useState } from "react";

interface Coordinates {
  lat: number | null;
  lng: number | null;
}

export default function BottomStatusBar() {
  const map = useMapStore((state) => state.map);
  const layers = useLayerStore((state) => state.layers);

  const [coordinates, setCoordinates] =
    useState<Coordinates>({
      lat: null,
      lng: null,
    });

  const [zoom, setZoom] = useState(8);

  useEffect(() => {
    if (!map) return;

    const updateCoordinates = (event: any) => {
      setCoordinates({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    };

    const updateZoom = () => {
      setZoom(map.getZoom());
    };

    map.on("mousemove", updateCoordinates);
    map.on("zoomend", updateZoom);

    updateZoom();

    return () => {
      map.off("mousemove", updateCoordinates);
      map.off("zoomend", updateZoom);
    };
  }, [map]);

  const visibleLayers = layers.filter(
    (layer) => layer.visible
  ).length;

  return (
    <footer
      className="
        flex
        h-10
        shrink-0
        items-center
        justify-between
        border-t
        bg-background
        px-4
        text-xs
        text-muted-foreground
      "
    >
      {/* Coordinates */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <MousePointer2 className="h-3.5 w-3.5 text-sky-500" />

          <span>Lat:</span>

          <span className="font-medium text-foreground">
            {coordinates.lat !== null
              ? coordinates.lat.toFixed(5) + "°"
              : "—"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <MapPinned className="h-3.5 w-3.5 text-sky-500" />

          <span>Lon:</span>

          <span className="font-medium text-foreground">
            {coordinates.lng !== null
              ? coordinates.lng.toFixed(5) + "°"
              : "—"}
          </span>
        </div>
      </div>

      {/* Map information */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-green-500" />

          <span>EPSG:4326</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5 text-orange-500" />

          <span>
            Zoom {zoom}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Layers3 className="h-3.5 w-3.5 text-violet-500" />

          <span>
            {visibleLayers} / {layers.length} Layers
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5 font-medium text-green-600">
        <span className="h-2 w-2 rounded-full bg-green-500" />

        Ready
      </div>
    </footer>
  );
}