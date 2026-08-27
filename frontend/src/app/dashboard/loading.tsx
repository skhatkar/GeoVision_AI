import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-muted/60 ${className ?? ""}`}
    />
  );
}

export default function DashboardLoading() {
  return (
    <AppShell>
      <PageHeader title="Dashboard" subtitle="Government GIS Intelligence Platform" />

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Chart + Map Row Skeleton */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>

      {/* AI + Activity Row Skeleton */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>

      {/* Projects + Uploads Row Skeleton */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </AppShell>
  );
}
