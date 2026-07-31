"use client";

import { useState } from "react";

import {
  ChevronDown,
  ChevronRight,
  LocateFixed,
  Palette,
} from "lucide-react";

import type { GISLayer } from "@/types/layer";

import LayerRow from "./LayerRow";
import LayerLegend from "./LayerLegend";
import OpacitySlider from "./OpacitySlider";

interface Props {
  layer: GISLayer;
}

export default function LayerCard({
  layer,
}: Props) {

  const [expanded, setExpanded] =
    useState(false);

  return (

    <div className="rounded-xl border bg-card shadow-sm">

      <div className="flex items-center">

        <div className="flex-1">

          <LayerRow
            layer={layer}
          />

        </div>

        <button
          onClick={() =>
            setExpanded(!expanded)
          }
          className="mr-2"
        >

          {expanded ? (

            <ChevronDown
              className="h-4 w-4"
            />

          ) : (

            <ChevronRight
              className="h-4 w-4"
            />

          )}

        </button>

      </div>

      {expanded && (

        <div className="space-y-4 border-t p-4">

          {/* Opacity */}

          <div>

            <div className="mb-2 flex justify-between text-xs">

              <span>Opacity</span>

              <span>
                {Math.round(
                  layer.opacity * 100
                )}
                %
              </span>

            </div>

            <OpacitySlider
              id={layer.id}
              opacity={layer.opacity}
            />

          </div>

          {/* Legend */}

          <LayerLegend
            layer={layer}
          />

          {/* Color */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <Palette className="h-4 w-4" />

              <span className="text-sm">
                Color
              </span>

            </div>

            <input
              type="color"
              value={layer.color}
              className="h-8 w-12 cursor-pointer rounded"
              readOnly
            />

          </div>

          {/* Width */}

          <div>

            <div className="mb-2 flex justify-between text-xs">

              <span>
                Line Width
              </span>

              <span>
                {layer.weight}px
              </span>

            </div>

            <input
              type="range"
              min={1}
              max={8}
              value={layer.weight}
              className="w-full"
              readOnly
            />

          </div>

          {/* Zoom */}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >

            <LocateFixed
              className="h-4 w-4"
            />

            Zoom to Layer

          </button>

        </div>

      )}

    </div>

  );

}