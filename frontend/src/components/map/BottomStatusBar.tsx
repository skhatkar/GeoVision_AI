"use client";

import { useEffect, useState } from "react";
import {
  MapPinned,
  MousePointer2,
  Globe,
  Gauge,
  Layers3,
  Activity,
} from "lucide-react";
import { useMapStore } from "@/store/mapStore";
import { useLayerStore } from "@/store/layerStore";

interface Coordinates {
  lat: number | null;
  lng: number | null;
}

export default function BottomStatusBar() {
  const map = useMapStore((state) => state.map);
  const layers = useLayerStore((state) => state.layers);

  const [coordinates, setCoordinates] = useState<Coordinates>({
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

  const visibleLayers = layers.filter((layer) => layer.visible).length;

  return (
    <footer
      className="
        flex
        h-9
        shrink-0
        items-center
        justify-between
        border-t
        bg-card/90
        backdrop-blur-md
        px-3.5
        text-[11px]
        text-muted-foreground
        z-20
      "
    >
      {/* Coordinates */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
          <MousePointer2 className="h-3 w-3 text-sky-500" />
          <span>Lat:</span>
          <span className="font-mono font-medium text-foreground">
            {coordinates.lat !== null ? coordinates.lat.toFixed(5) + "°" : "—"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
          <MapPinned className="h-3 w-3 text-sky-500" />
          <span>Lng:</span>
          <span className="font-mono font-medium text-foreground">
            {coordinates.lng !== null ? coordinates.lng.toFixed(5) + "°" : "—"}
          </span>
        </div>
      </div>

      {/* Map information */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded-md text-foreground">
          <Globe className="h-3 w-3 text-emerald-500" />
          <span className="font-mono text-[10px]">WGS 84 (EPSG:4326)</span>
        </div>

        <div className="flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded-md text-foreground">
          <Gauge className="h-3 w-3 text-amber-500" />
          <span className="font-mono text-[10px]">Zoom {zoom}</span>
        </div>

        <div className="flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded-md text-foreground">
          <Layers3 className="h-3 w-3 text-violet-500" />
          <span className="font-mono text-[10px]">
            {visibleLayers} / {layers.length} Visible
          </span>
        </div>
      </div>
    </footer>
  );
}