import AppShell from "@/components/layout/AppShell";

export default function DatasetsLoading() {
  return (
    <AppShell>
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-xl bg-muted/60" />
          <div className="h-4 w-80 rounded-lg bg-muted/40" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 rounded-xl bg-muted/50" />
          <div className="h-10 w-36 rounded-xl bg-muted/70" />
        </div>
      </div>

      {/* Stats / Filter Bar */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
        <div className="h-10 w-full sm:w-80 rounded-xl bg-muted/40" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 rounded-lg bg-muted/40" />
          <div className="h-9 w-24 rounded-lg bg-muted/40" />
        </div>
      </div>

      {/* Datasets Table Skeleton */}
      <div className="mt-6 rounded-2xl border border-border/60 bg-card overflow-hidden animate-pulse">
        <div className="border-b border-border/50 bg-muted/20 p-4 flex items-center justify-between">
          <div className="h-4 w-28 rounded bg-muted/50" />
          <div className="h-4 w-20 rounded bg-muted/50" />
        </div>

        <div className="divide-y divide-border/40 p-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-muted/50 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-48 rounded bg-muted/60" />
                  <div className="h-3 w-64 rounded bg-muted/40" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-20 rounded-full bg-muted/40" />
                <div className="h-6 w-16 rounded-full bg-muted/40" />
                <div className="h-8 w-8 rounded-lg bg-muted/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
