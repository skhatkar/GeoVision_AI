import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted/60 ${className ?? ""}`} />;
}

export default function DatasetsLoading() {
  return (
    <AppShell>
      <PageHeader title="Datasets" subtitle="Spatial Data Management" />

      {/* Toolbar */}
      <div className="mt-6 flex items-center gap-3">
        <Skeleton className="h-9 w-64 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl ml-auto" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="mt-5 rounded-2xl border border-border/60 bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-border/60 bg-muted/30">
          {[140, 100, 80, 100, 80, 60].map((w, i) => (
            <Skeleton key={i} className={`h-3 rounded w-[${w}px]`} style={{ width: w }} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border/40 last:border-0">
            <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-24 ml-auto" />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
