import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted/60 ${className ?? ""}`} />;
}

export default function ProjectsLoading() {
  return (
    <AppShell>
      <PageHeader title="Projects" subtitle="GIS Project Management" />

      {/* Toolbar */}
      <div className="mt-6 flex items-center gap-3">
        <Skeleton className="h-9 w-64 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl ml-auto" />
      </div>

      {/* Project Cards Grid */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
