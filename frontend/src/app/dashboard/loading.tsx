import AppShell from "@/components/layout/AppShell";

export default function DashboardLoading() {
  return (
    <AppShell>
      {/* Header Skeleton */}
      <div className="space-y-2 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-muted/60" />
        <div className="h-4 w-72 rounded-lg bg-muted/40" />
      </div>

      {/* 4 Stats Cards Skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-muted/60" />
              <div className="h-9 w-9 rounded-xl bg-muted/50" />
            </div>
            <div className="h-8 w-28 rounded-lg bg-muted/70" />
            <div className="h-3 w-36 rounded bg-muted/40" />
          </div>
        ))}
      </div>

      {/* Main Charts & Map Row Skeleton */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2 animate-pulse">
        {/* Chart Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="space-y-1.5">
              <div className="h-5 w-40 rounded bg-muted/60" />
              <div className="h-3 w-56 rounded bg-muted/40" />
            </div>
            <div className="h-7 w-20 rounded-lg bg-muted/50" />
          </div>
          <div className="h-64 rounded-xl bg-muted/30" />
        </div>

        {/* Map Preview Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="space-y-1.5">
              <div className="h-5 w-36 rounded bg-muted/60" />
              <div className="h-3 w-48 rounded bg-muted/40" />
            </div>
            <div className="h-7 w-24 rounded-lg bg-muted/50" />
          </div>
          <div className="h-64 rounded-xl bg-muted/30 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
        </div>
      </div>

      {/* Middle Row Skeleton: AI Insights & Recent Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2 animate-pulse">
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div className="h-5 w-36 rounded bg-muted/60" />
          <div className="space-y-2.5">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-14 rounded-xl bg-muted/30" />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div className="h-5 w-36 rounded bg-muted/60" />
          <div className="space-y-2.5">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-14 rounded-xl bg-muted/30" />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row Skeleton: Projects & Uploads */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2 animate-pulse">
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
          <div className="h-5 w-32 rounded bg-muted/60" />
          <div className="h-40 rounded-xl bg-muted/30" />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
          <div className="h-5 w-32 rounded bg-muted/60" />
          <div className="h-40 rounded-xl bg-muted/30" />
        </div>
      </div>
    </AppShell>
  );
}
