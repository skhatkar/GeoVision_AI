"use client";

import { useState } from "react";
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

type Group = {
  title: string;
  icon: React.ReactNode;
  layers: string[];
};

const groups: Group[] = [
  {
    title: "Administrative",
    icon: <Database className="h-4 w-4 text-emerald-500" />,
    layers: [
      "State Boundary",
      "District Boundary",
      "Blocks",
      "Panchayats",
      "Villages",
    ],
  },
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

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    BaseMaps: true,
    Administrative: true,
    Infrastructure: true,
    Terrain: false,
    Environment: false,
  });

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <aside className="w-80 border-r bg-background flex flex-col">

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

      {/* Content */}

      <div className="flex-1 overflow-y-auto">

        {/* Base Maps */}

        <div className="border-b">

          <button
            onClick={() => toggleGroup("BaseMaps")}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-sky-500" />
              <span className="font-medium">
                Base Maps
              </span>
            </div>

            {openGroups.BaseMaps ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {openGroups.BaseMaps && (
            <div className="space-y-3 px-6 pb-4">

              <BasemapSwitcher />

            </div>
          )}

        </div>

        {/* Other Groups */}

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

                  <span className="font-medium">
                    {group.title}
                  </span>
                </div>

                {openGroups[group.title] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {openGroups[group.title] && (
                <div className="space-y-2 px-8 pb-4">

                  {filteredLayers.map((layer) => (
                    <label
                      key={layer}
                      className="flex cursor-pointer items-center gap-2 text-sm"
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