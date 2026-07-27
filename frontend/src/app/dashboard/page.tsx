import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";

import StatsGrid from "@/components/dashboard/StatsGrid";
import AssetChart from "@/components/charts/AssetChart";

import MapPreviewClient from "@/components/map/MapPreviewClient";

import AIInsights from "@/components/dashboard/AIInsights";
import RecentActivity from "@/components/dashboard/RecentActivity";
import RecentProjects from "@/components/dashboard/RecentProjects";
import RecentUploads from "@/components/tables/RecentUploads";

export default function DashboardPage() {
  return (
    <AppShell>

      <PageHeader
        title="Dashboard"
        subtitle="Government GIS Intelligence Platform"
      />

      <StatsGrid />

      <div className="grid gap-6 mt-8 lg:grid-cols-2">

        <AssetChart />

        <MapPreviewClient />

      </div>

      <div className="grid gap-6 mt-6 lg:grid-cols-2">

        <AIInsights />

        <RecentActivity />

      </div>

      <div className="grid gap-6 mt-6 lg:grid-cols-2">

        <RecentProjects />

        <RecentUploads />

      </div>

    </AppShell>
  );
}