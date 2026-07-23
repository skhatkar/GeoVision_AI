import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";

import StatsGrid from "@/components/dashboard/StatsGrid";
import AssetChart from "@/components/charts/AssetChart";
import MapPreviewClient from "@/components/map/MapPreviewClient";

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        subtitle="Government GIS Intelligence Platform"
      />

      <StatsGrid />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AssetChart />
        <MapPreviewClient />
      </div>
    </AppShell>
  );
}