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
import { useLayerStore } from "@/store/layerStore";

export default function LeftPanel() {
  const [search, setSearch] = useState("");

  const { layers, toggleLayer } = useLayerStore();

  const [open, setOpen] = useState({
    basemap: true,
    admin: true,
    infra: false,
    terrain: false,
    env: false,
  });

  const toggle = (key: keyof typeof open) =>
    setOpen((p) => ({
      ...p,
      [key]: !p[key],
    }));

  return (
    <aside className="w-80 border-r bg-background flex flex-col">

      {/* Header */}

      <div className="border-b p-4">

        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Layers3 className="h-5 w-5 text-sky-500" />
          Layers
        </h2>

        <p className="text-sm text-muted-foreground">
          GIS Layer Manager
        </p>

      </div>

      {/* Search */}

      <div className="border-b p-4">

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search layers..."
          className="w-full rounded-lg border px-3 py-2"
        />

      </div>

      <div className="flex-1 overflow-y-auto">

        {/* Basemap */}

        <button
          onClick={() => toggle("basemap")}
          className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted"
        >

          <div className="flex items-center gap-2">

            <Map className="h-4 w-4 text-sky-500" />
            Base Maps

          </div>

          {open.basemap ? <ChevronDown /> : <ChevronRight />}

        </button>

        {open.basemap && (
          <div className="px-6 pb-4">

            <BasemapSwitcher />

          </div>
        )}

        {/* Administrative */}

        <button
          onClick={() => toggle("admin")}
          className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted"
        >

          <div className="flex items-center gap-2">

            <Database className="h-4 w-4 text-emerald-500" />

            Administrative

          </div>

          {open.admin ? <ChevronDown /> : <ChevronRight />}

        </button>

        {open.admin && (
          <div className="space-y-2 px-8 pb-4">

            {layers
              .filter((l) =>
                l.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((layer) => (
                <label
                  key={layer.id}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() => toggleLayer(layer.id)}
                  />

                  {layer.name}
                </label>
              ))}

          </div>
        )}

        {/* Infrastructure */}

        <button
          onClick={() => toggle("infra")}
          className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted"
        >

          <div className="flex items-center gap-2">

            <Route className="h-4 w-4 text-orange-500" />

            Infrastructure

          </div>

          {open.infra ? <ChevronDown /> : <ChevronRight />}

        </button>

        {/* Terrain */}

        <button
          onClick={() => toggle("terrain")}
          className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted"
        >

          <div className="flex items-center gap-2">

            <Mountain className="h-4 w-4 text-purple-500" />

            Terrain

          </div>

          {open.terrain ? <ChevronDown /> : <ChevronRight />}

        </button>

        {/* Environment */}

        <button
          onClick={() => toggle("env")}
          className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted"
        >

          <div className="flex items-center gap-2">

            <Trees className="h-4 w-4 text-green-600" />

            Environment

          </div>

          {open.env ? <ChevronDown /> : <ChevronRight />}

        </button>

      </div>

    </aside>
  );
}