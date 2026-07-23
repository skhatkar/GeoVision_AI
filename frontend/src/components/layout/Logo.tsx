import { Globe2 } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 shadow-lg">
        <Globe2 className="h-6 w-6 text-white" />
      </div>

      <div>
        <h1 className="text-lg font-bold tracking-tight">
          GeoVision AI
        </h1>

        <p className="text-xs text-muted-foreground">
          Government GIS Platform
        </p>
      </div>
    </div>
  );
}