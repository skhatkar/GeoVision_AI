"use client";

import { Badge } from "@/components/ui/badge";
import { GISLayer } from "@/types/layer";

interface Props {
  layer: GISLayer;
}

export default function LayerBadge({
  layer,
}: Props) {
  return (
    <Badge variant="secondary">
      {layer.type.toUpperCase()}
    </Badge>
  );
}