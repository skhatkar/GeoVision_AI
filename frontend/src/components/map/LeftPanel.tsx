"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import {
  ChevronDown,
  ChevronRight,
  Database,
  Layers3,
  Map,
  Mountain,
  Route,
  Trees,
} from "lucide-react";

import BasemapSwitcher from "./BasemapSwitcher";

// ✅ LayerList is now inside components/layers
const LayerListDynamic = dynamic(
  () => import("@/components/layers/LayerList"),
  {
    ssr: false,
  }
);

type Group = {
  title: string;
  icon: React.ReactNode;
  layers: string[];
};

const groups: Group[] = [
  {
    title: "Infrastructure",
    icon: <Route className="h-4 w-4 text-orange-500" />,
    layers: [
      "Road Network",
      "Buildings",
      "Bridges",
      "Electric Lines",
    ],
  },
  {
    title: "Terrain",
    icon: <Mountain className="h-4 w-4 text-purple-500" />,
    layers: [
      "DEM",
      "Slope",
      "Contours",
      "Hillshade",
    ],
  },
  {
    title: "Environment",
    icon: <Trees className="h-4 w-4 text-green-600" />,
    layers: [
      "Forest",
      "Rivers",
      "Water Bodies",
      "Land Cover",
    ],
  },
];

export default function LeftPanel() {
  const [search, setSearch] = useState("");

  const [openGroups, setOpenGroups] = useState({
    BaseMaps: true,
    Administrative: true,
    Infrastructure: true,
    Terrain: false,
    Environment: false,
  });

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group as keyof typeof prev],
    }));
  };

  return (
    <aside className="flex w-80 flex-col border-r bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Layers3 className="h-5 w-5 text-sky-500" />
          Layers
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage GIS Layers
        </p>
      </div>

      {/* Search */}
      <div className="border-b p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search layers..."
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ================= Base Maps ================= */}

        <div className="border-b">
          <button
            onClick={() => toggleGroup("BaseMaps")}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-sky-500" />
              <span className="font-medium">Base Maps</span>
            </div>

            {openGroups.BaseMaps ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {openGroups.BaseMaps && (
            <div className="px-5 pb-4 pt-2">
              <BasemapSwitcher />
            </div>
          )}
        </div>

        {/* ================= Administrative ================= */}

        <div className="border-b">
          <button
            onClick={() => toggleGroup("Administrative")}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">Administrative</span>
            </div>

            {openGroups.Administrative ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {openGroups.Administrative && (
            <div className="px-3 pb-4 pt-2">
              <LayerListDynamic search={search} />
            </div>
          )}
        </div>

        {/* ================= Other Groups ================= */}

        {groups.map((group) => {
          const filteredLayers = group.layers.filter((layer) =>
            layer.toLowerCase().includes(search.toLowerCase())
          );

          return (
            <div
              key={group.title}
              className="border-b"
            >
              <button
                onClick={() => toggleGroup(group.title)}
                className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted"
              >
                <div className="flex items-center gap-2">
                  {group.icon}
                  <span className="font-medium">{group.title}</span>
                </div>

                {openGroups[group.title as keyof typeof openGroups] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {openGroups[group.title as keyof typeof openGroups] && (
                <div className="space-y-2 px-8 pb-4">
                  {filteredLayers.map((layer) => (
                    <label
                      key={layer}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        className="accent-sky-600"
                      />
                      {layer}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}