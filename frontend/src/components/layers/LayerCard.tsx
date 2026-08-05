"use client";

import { GISLayer } from "@/types/layer";

import LayerRow from "./LayerRow";
import LayerOpacity from "./LayerOpacity";
import LayerActions from "./LayerActions";
import LayerDetails from "./LayerDetails";

interface Props {
  layer: GISLayer;
}

export default function LayerCard({
  layer,
}: Props) {
  return (
    <div className="rounded-xl border bg-card shadow-sm hover:shadow-md transition p-4 space-y-4">

      <LayerRow layer={layer} />

      <LayerDetails layer={layer} />

      <LayerOpacity layer={layer} />

      <LayerActions layer={layer} />

    </div>
  );
}