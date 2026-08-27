"use client";

import LayerIconBadge from "./LayerIconBadge";

interface Props {
  geometryType?: string;
  color: string;
  icon?: string;
  customIcon?: string;
}

export default function LayerLegend({
  geometryType,
  color,
  icon,
  customIcon,
}: Props) {
  return (
    <LayerIconBadge
      geometryType={geometryType}
      color={color}
      icon={icon}
      customIcon={customIcon}
      size="sm"
    />
  );
}