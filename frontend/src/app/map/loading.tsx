import AppShell from "@/components/layout/AppShell";
import { Loader2 } from "lucide-react";

export default function MapLoading() {
  return (
    <AppShell>
      {/* Header Skeleton */}
      <div className="space-y-2 animate-pulse">
        <div className="h-8 w-56 rounded-xl bg-muted/60" />
        <div className="h-4 w-80 rounded-lg bg-muted/40" />
      </div>

      {/* Main Map Viewer Shell Skeleton */}
      <div className="mt-6 flex h-[calc(100vh-180px)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm animate-pulse">
        {/* Top Toolbar Skeleton */}
        <div className="flex h-12 items-center justify-between border-b border-border/50 bg-muted/30 px-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-8 w-8 rounded-lg bg-muted/60" />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-36 rounded-lg bg-muted/50" />
            <div className="h-8 w-28 rounded-lg bg-muted/50" />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel Skeleton */}
          <div className="w-80 border-r border-border/50 bg-muted/10 p-4 space-y-4 hidden md:block">
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 rounded bg-muted/60" />
              <div className="h-7 w-7 rounded-lg bg-muted/50" />
            </div>
            <div className="h-9 rounded-xl bg-muted/40" />
            <div className="space-y-2 pt-2">
              {[1, 2, 3, 4, 5].map((k) => (
                <div key={k} className="h-12 rounded-xl bg-muted/30" />
              ))}
            </div>
          </div>

          {/* Central Map Canvas Skeleton */}
          <div className="relative flex-1 bg-muted/20 flex flex-col items-center justify-center">
            {/* Grid Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#888 1px, transparent 1px), linear-gradient(90deg, #888 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative z-10 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-md">
                <Loader2 size={28} className="animate-spin" />
              </div>
              <p className="text-xs font-bold text-foreground tracking-tight">Initializing Spatial Leaflet Engine…</p>
              <p className="text-[11px] text-muted-foreground">Loading PostGIS layers, tiles & geodesic projection</p>
            </div>
          </div>

          {/* Right Panel Skeleton */}
          <div className="w-72 border-l border-border/50 bg-muted/10 p-4 space-y-3 hidden lg:block">
            <div className="h-5 w-32 rounded bg-muted/60" />
            <div className="h-32 rounded-xl bg-muted/30" />
            <div className="space-y-2 pt-2">
              <div className="h-8 rounded-lg bg-muted/30" />
              <div className="h-8 rounded-lg bg-muted/30" />
              <div className="h-8 rounded-lg bg-muted/30" />
            </div>
          </div>
        </div>

        {/* Bottom Status Bar Skeleton */}
        <div className="flex h-8 items-center justify-between border-t border-border/50 bg-muted/40 px-4 text-xs">
          <div className="h-3 w-44 rounded bg-muted/50" />
          <div className="h-3 w-36 rounded bg-muted/50" />
        </div>
      </div>
    </AppShell>
  );
}
