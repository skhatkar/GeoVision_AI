import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted/60 ${className ?? ""}`} />;
}

export default function SettingsLoading() {
  return (
    <AppShell>
      <PageHeader title="Settings & System Preferences" subtitle="Loading your preferences…" />

      {/* Tab Bar Skeleton */}
      <div className="mt-6 flex gap-2 p-1 rounded-xl bg-muted/50 border border-border/70 w-fit">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>

      {/* Card Skeleton */}
      <div className="mt-6 rounded-2xl border border-border/60 bg-card p-6 space-y-5 max-w-3xl">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-80" />
        </div>

        {/* Avatar Row */}
        <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-muted/20">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4 max-w-xl sm:grid-cols-2">
          <Skeleton className="h-9 rounded-xl sm:col-span-2" />
          <Skeleton className="h-9 rounded-xl" />
          <Skeleton className="h-9 rounded-xl" />
          <Skeleton className="h-9 rounded-xl sm:col-span-2" />
        </div>

        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>
    </AppShell>
  );
}
