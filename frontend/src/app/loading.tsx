export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Animated GIS Grid Spinner */}
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-ping" />
          <div className="absolute inset-1 rounded-xl border-2 border-primary/40 animate-pulse" />
          <div className="absolute inset-2.5 rounded-lg bg-gradient-to-tr from-primary to-emerald-500 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-foreground tracking-tight">GeoVision AI</p>
          <p className="text-xs text-muted-foreground animate-pulse">Loading spatial data…</p>
        </div>
      </div>
    </div>
  );
}
