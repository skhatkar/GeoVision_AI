import AppShell from "@/components/layout/AppShell";

export default function ProjectsLoading() {
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

      {/* Projects Grid Skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-muted/50" />
              <div className="h-6 w-16 rounded-full bg-muted/40" />
            </div>
            <div className="space-y-1.5">
              <div className="h-5 w-44 rounded bg-muted/70" />
              <div className="h-3 w-60 rounded bg-muted/40" />
            </div>
            <div className="border-t border-border/40 pt-3 flex items-center justify-between text-xs">
              <div className="h-3 w-24 rounded bg-muted/40" />
              <div className="h-3 w-16 rounded bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
