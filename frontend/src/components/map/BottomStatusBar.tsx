"use client";

import {
  MapPinned,
  MousePointer2,
  Globe,
  Gauge,
  Layers3,
} from "lucide-react";

export default function BottomStatusBar() {
  return (
    <footer className="flex h-10 items-center justify-between border-t bg-background px-4 text-sm">

      {/* Left */}

      <div className="flex items-center gap-6">

        <div className="flex items-center gap-2">
          <MousePointer2 className="h-4 w-4 text-sky-500" />
          <span>Lat:</span>
          <span className="font-medium">31.1048°</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPinned className="h-4 w-4 text-sky-500" />
          <span>Lon:</span>
          <span className="font-medium">77.1734°</span>
        </div>

      </div>

      {/* Center */}

      <div className="flex items-center gap-6">

        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-green-500" />
          EPSG:4326
        </div>

        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-orange-500" />
          Zoom 8
        </div>

        <div className="flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-violet-500" />
          4 Layers
        </div>

      </div>

      {/* Right */}

      <div className="text-green-600 font-medium">
        ● Ready
      </div>

    </footer>
  );
}