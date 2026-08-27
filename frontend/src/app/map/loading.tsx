import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted/60 ${className ?? ""}`} />;
}

export default function MapLoading() {
  return (
    <AppShell>
      <PageHeader title="GIS Map Viewer" subtitle="GeoVision AI Spatial Intelligence Platform" />

      <div className="mt-6 h-[calc(100vh-180px)] rounded-xl border border-border/60 bg-card overflow-hidden flex flex-col">
        {/* Top Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-muted/30">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-9 rounded-lg" />
          ))}
          <Skeleton className="h-8 w-32 rounded-lg ml-auto" />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel */}
          <div className="w-72 border-r border-border/60 p-4 space-y-3">
            <Skeleton className="h-8 w-full rounded-lg" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/40">
                <Skeleton className="h-6 w-6 rounded-lg shrink-0" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
            ))}
          </div>

          {/* Map Area */}
          <div className="relative flex-1 bg-muted/20 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="relative h-16 w-16 mx-auto">
                <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping" />
                <div className="absolute inset-2 rounded-xl bg-gradient-to-tr from-primary/40 to-emerald-500/40 animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground animate-pulse font-medium">Loading map layers…</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-64 border-l border-border/60 p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-4 w-20 mt-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>

        {/* Bottom Status */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border/60 bg-muted/20">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-24 ml-auto" />
        </div>
      </div>
    </AppShell>
  );
}
