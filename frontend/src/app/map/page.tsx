import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";

import LeftPanel from "@/components/map/LeftPanel";
import RightPanel from "@/components/map/RightPanel";
import TopToolbar from "@/components/map/TopToolbar";
import BottomStatusBar from "@/components/map/BottomStatusBar";
import MapPreviewClient from "@/components/map/MapPreviewClient";
import Toolbar from "@/components/toolbar/Toolbar";
import LayerLoader from "@/components/map/LayerLoader";

export default function MapPage() {


  return (
    <AppShell>
      <PageHeader
        title="GIS Map Viewer"
        subtitle="GeoVision AI Spatial Intelligence Platform"
      />
      <LayerLoader />
      <div className="mt-6 flex h-[calc(100vh-180px)] flex-col overflow-hidden rounded-xl border bg-card">

        {/* Top Toolbar */}
        <TopToolbar />
      

        {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">

            <LeftPanel />

            <div className="relative flex-1 overflow-hidden">

              <MapPreviewClient />

              <Toolbar />

            </div>

            <RightPanel />

          </div>

        {/* Bottom Status */}
        <BottomStatusBar />

      </div>
    </AppShell>
  );
}
