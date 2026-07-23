"use client";

import Logo from "./Logo";
import SidebarItem from "./SidebarItem";

import {

LayoutDashboard,

Database,

Layers,

Map,

FolderKanban,

Box,

Brain,

ChartColumnIncreasing,

Workflow,

Settings

} from "lucide-react";

export default function Sidebar() {

  return (

    <aside className="fixed left-0 top-0 h-screen w-72 border-r bg-card">

      <div className="p-6">

        <Logo />

      </div>

      <nav className="space-y-2 px-4">

        <SidebarItem
          href="/dashboard"
          title="Dashboard"
          icon={<LayoutDashboard size={20} />}
        />

        <SidebarItem
          href="/projects"
          title="Projects"
          icon={<FolderKanban size={20} />}
        />

        <SidebarItem
          href="/datasets"
          title="Datasets"
          icon={<Database size={20} />}
        />

        <SidebarItem
          href="/layers"
          title="Layers"
          icon={<Layers size={20} />}
        />

        <SidebarItem
          href="/assets"
          title="Assets"
          icon={<Box size={20} />}
        />

        <SidebarItem
          href="/map"
          title="Map"
          icon={<Map size={20} />}
        />

        <SidebarItem
          href="/analysis"
          title="Analysis"
          icon={<Workflow size={20} />}
        />

        <SidebarItem
          href="/analytics"
          title="Analytics"
          icon={<ChartColumnIncreasing size={20} />}
        />

        <SidebarItem
          href="/ai"
          title="GeoVision AI"
          icon={<Brain size={20} />}
        />

        <SidebarItem
          href="/settings"
          title="Settings"
          icon={<Settings size={20} />}
        />

      </nav>

    </aside>

  );

}