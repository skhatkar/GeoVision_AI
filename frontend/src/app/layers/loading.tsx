import AppShell from "@/components/layout/AppShell";

export default function LayersLoading() {
  return (
    <AppShell>
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-xl bg-muted/60" />
          <div className="h-4 w-72 rounded-lg bg-muted/40" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-muted/60" />
      </div>

      {/* Layers Catalog Skeleton */}
      <div className="mt-8 space-y-3 animate-pulse">
        <div className="h-10 w-full sm:w-80 rounded-xl bg-muted/40" />

        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted/50 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-52 rounded bg-muted/60" />
                  <div className="h-3 w-64 rounded bg-muted/40" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-20 rounded-full bg-muted/40" />
                <div className="h-8 w-24 rounded-lg bg-muted/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
