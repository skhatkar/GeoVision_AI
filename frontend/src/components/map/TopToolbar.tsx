"use client";

import {
  MousePointer2,
  Move,
  ZoomIn,
  ZoomOut,
  LocateFixed,
  Ruler,
  Pencil,
  Pentagon,
  Search,
  Layers3,
  BrainCircuit,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react";
import BasemapSwitcher from "./BasemapSwitcher";

export default function TopToolbar() {
  const tools = [
    { icon: MousePointer2, label: "Select" },
    { icon: Move, label: "Pan" },
    { icon: ZoomIn, label: "Zoom In" },
    { icon: ZoomOut, label: "Zoom Out" },
    { icon: LocateFixed, label: "Locate" },
    { icon: Ruler, label: "Measure" },
    { icon: Pencil, label: "Draw" },
    { icon: Pentagon, label: "Polygon" },
  ];

  return (
    <header className="flex items-center justify-between border-b bg-background px-4 py-3">

      {/* Left Tools */}
      <div className="flex items-center gap-2">

        <BasemapSwitcher />

        {tools.map((tool) => (
          <button
            key={tool.label}
            title={tool.label}
            className="rounded-lg border p-2 transition hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-800"
          >
            <tool.icon className="h-5 w-5" />
          </button>
        ))}

      </div>

      {/* Center Search */}

      <div className="flex w-[340px] items-center rounded-lg border px-3">

        <Search className="mr-2 h-4 w-4 text-gray-400" />

        <input
          type="text"
          placeholder="Search village, asset, layer..."
          className="w-full bg-transparent py-2 text-sm outline-none"
        />

      </div>

      {/* Right Tools */}

      <div className="flex items-center gap-2">

        <button className="rounded-lg border p-2 hover:bg-muted">
          <Layers3 className="h-5 w-5" />
        </button>

        <button className="rounded-lg border p-2 hover:bg-muted">
          <Upload className="h-5 w-5" />
        </button>

        <button className="rounded-lg border p-2 hover:bg-muted">
          <Download className="h-5 w-5" />
        </button>

        <button className="rounded-lg border p-2 hover:bg-muted">
          <RefreshCw className="h-5 w-5" />
        </button>

        <button className="rounded-lg bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700">
          <span className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            AI Analysis
          </span>
        </button>

      </div>

    </header>
  );
}