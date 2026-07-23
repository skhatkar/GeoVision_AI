import { BarChart3 } from "lucide-react";

export default function AnalyticsCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-card p-8 shadow-lg">

      <div className="flex items-center gap-3">

        <BarChart3 className="text-sky-400" />

        <h2 className="text-xl font-semibold">
          GIS Analytics
        </h2>

      </div>

      <div className="mt-8 flex h-80 items-center justify-center rounded-2xl border border-dashed border-white/10">

        <p className="text-muted-foreground">
          Charts coming next...
        </p>

      </div>

    </div>
  );
}