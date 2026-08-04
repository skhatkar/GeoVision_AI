"use client";

import { Trash2 } from "lucide-react";

import { useDrawingStore } from "@/store/drawingStore";

export default function DrawingsPanel() {
  const drawings = useDrawingStore((s) => s.drawings);
  const removeDrawing = useDrawingStore((s) => s.removeDrawing);

  if (drawings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4">
        <h3 className="font-semibold mb-2">Drawings</h3>

        <p className="text-sm text-muted-foreground">
          No drawings available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">
        Drawings ({drawings.length})
      </h3>

      {drawings.map((layer: any, index: number) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <p className="font-medium">
              Drawing {index + 1}
            </p>

            <p className="text-xs text-muted-foreground">
              {layer?.pm?.shape || "Geometry"}
            </p>
          </div>

          <button
            onClick={() => {
              layer.remove();
              removeDrawing(layer);
            }}
            className="rounded p-2 hover:bg-red-100 dark:hover:bg-red-900"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      ))}
    </div>
  );
}