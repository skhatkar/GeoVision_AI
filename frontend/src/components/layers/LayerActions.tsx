"use client";

import {
  Download,
  Info,
  LocateFixed,
  Trash2,
} from "lucide-react";

import { GISLayer } from "@/types/layer";

interface Props {
  layer: GISLayer;
}

export default function LayerActions({
  layer,
}: Props) {
  return (
    <div className="flex items-center justify-end gap-2 border-t pt-3">

      <button
        className="rounded-md p-2 hover:bg-muted transition"
        title="Zoom to Layer"
      >
        <LocateFixed size={16} />
      </button>

      <button
        className="rounded-md p-2 hover:bg-muted transition"
        title="Layer Information"
      >
        <Info size={16} />
      </button>

      <button
        className="rounded-md p-2 hover:bg-muted transition"
        title="Download"
      >
        <Download size={16} />
      </button>

      <button
        className="rounded-md p-2 hover:bg-red-100 text-red-600 transition"
        title="Remove Layer"
      >
        <Trash2 size={16} />
      </button>

    </div>
  );
}