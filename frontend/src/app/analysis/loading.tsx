import AppShell from "@/components/layout/AppShell";

export default function AnalysisLoading() {
  return (
    <AppShell>
      {/* Header Skeleton */}
      <div className="space-y-2 animate-pulse">
        <div className="h-8 w-60 rounded-xl bg-muted/60" />
        <div className="h-4 w-96 rounded-lg bg-muted/40" />
      </div>

      {/* Main Analysis Layout Skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 animate-pulse">
        {/* Left Tool Catalog Skeleton */}
        <div className="lg:col-span-4 rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="h-5 w-32 rounded bg-muted/60" />
            <div className="h-4 w-16 rounded bg-muted/40" />
          </div>
          <div className="h-9 rounded-xl bg-muted/40" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-muted/30" />
            ))}
          </div>
        </div>

        {/* Center/Right Parameter & Execution Console Skeleton */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Tool Parameters */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="space-y-1.5">
                <div className="h-6 w-48 rounded bg-muted/60" />
                <div className="h-3 w-72 rounded bg-muted/40" />
              </div>
              <div className="h-8 w-24 rounded-lg bg-muted/50" />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded bg-muted/50" />
                <div className="h-10 rounded-xl bg-muted/30" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-32 rounded bg-muted/50" />
                <div className="h-10 rounded-xl bg-muted/30" />
              </div>
              <div className="pt-2">
                <div className="h-11 w-full rounded-xl bg-muted/60" />
              </div>
            </div>
          </div>

          {/* Results Console */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
            <div className="h-5 w-40 rounded bg-muted/60" />
            <div className="h-48 rounded-xl bg-muted/20" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
