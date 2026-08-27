import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted/60 ${className ?? ""}`} />;
}

export default function AnalysisLoading() {
  return (
    <AppShell>
      <PageHeader title="Spatial Analysis" subtitle="PostGIS Intelligence Engine" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Tool Panel Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-9 w-full rounded-xl" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Results Panel Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </AppShell>
  );
}
