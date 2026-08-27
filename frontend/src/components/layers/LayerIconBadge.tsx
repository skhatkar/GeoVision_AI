"use client";

import {
  MapPin,
  TrendingUp,
  Square,
  Layers,
  Circle,
  Building2,
  Shield,
  Trees,
  GraduationCap,
  Star,
  AlertTriangle,
  Droplets,
  Flame,
  Cross,
} from "lucide-react";
import type { GISLayer } from "@/types/layer";

interface Props {
  layer?: GISLayer | null;
  geometryType?: string | null;
  icon?: string | null;
  customIcon?: string | null;
  color?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

const PRESET_ICONS: Record<string, any> = {
  hospital: Cross,
  shield: Shield,
  tree: Trees,
  school: GraduationCap,
  building: Building2,
  star: Star,
  alert: AlertTriangle,
  water: Droplets,
  fire: Flame,
  pin: MapPin,
  circle: Circle,
};

export default function LayerIconBadge({
  layer,
  geometryType: propGeom,
  icon: propIcon,
  customIcon: propCustomIcon,
  color: propColor,
  size = "md",
  className = "",
  onClick,
}: Props) {
  const geom = (layer?.geometryType || propGeom || "").toLowerCase();
  const iconKey = (layer?.icon || propIcon || "").toLowerCase();
  const customImg = layer?.customIcon || propCustomIcon;
  const color = layer?.color || propColor || "#2563EB";

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-11 w-11 text-base",
  }[size];

  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 20,
  }[size];

  // 1. Uploaded custom image icon
  if (customImg) {
    return (
      <div
        onClick={onClick}
        className={`
          relative flex shrink-0 items-center justify-center rounded-xl border-2 bg-white shadow-xs overflow-hidden p-0.5 transition-transform
          ${onClick ? "cursor-pointer hover:scale-110" : ""}
          ${sizeClasses}
          ${className}
        `}
        style={{ borderColor: color }}
        title="Custom Layer Icon"
      >
        <img
          src={customImg}
          alt="Layer Icon"
          className="h-full w-full object-contain rounded-lg"
        />
      </div>
    );
  }

  // 2. Preset custom symbol icon (Hospital, Shield, Tree, etc.)
  if (iconKey && PRESET_ICONS[iconKey] && iconKey !== "circle") {
    const IconComponent = PRESET_ICONS[iconKey];
    return (
      <div
        onClick={onClick}
        className={`
          relative flex shrink-0 items-center justify-center rounded-xl text-white shadow-xs transition-transform
          ${onClick ? "cursor-pointer hover:scale-110" : ""}
          ${sizeClasses}
          ${className}
        `}
        style={{ backgroundColor: color }}
        title={`Layer Icon: ${iconKey}`}
      >
        <IconComponent size={iconSizes} className="text-white" />
      </div>
    );
  }

  // 3. Point geometry with default circle
  if (geom.includes("point") || iconKey === "circle") {
    return (
      <div
        onClick={onClick}
        className={`
          relative flex shrink-0 items-center justify-center rounded-xl bg-sky-500/15 transition-transform
          ${onClick ? "cursor-pointer hover:scale-110" : ""}
          ${sizeClasses}
          ${className}
        `}
        style={{
          backgroundColor: `${color}20`,
        }}
        title="Point Layer"
      >
        <div
          className="rounded-full border-2 border-white shadow-xs"
          style={{
            backgroundColor: color,
            width: size === "sm" ? "10px" : size === "md" ? "13px" : "16px",
            height: size === "sm" ? "10px" : size === "md" ? "13px" : "16px",
          }}
        />
      </div>
    );
  }

  // 4. Line geometry
  if (geom.includes("line")) {
    return (
      <div
        onClick={onClick}
        className={`
          relative flex shrink-0 items-center justify-center rounded-xl transition-transform
          ${onClick ? "cursor-pointer hover:scale-110" : ""}
          ${sizeClasses}
          ${className}
        `}
        style={{ backgroundColor: `${color}20` }}
        title="Line Layer"
      >
        <TrendingUp size={iconSizes} style={{ color }} />
      </div>
    );
  }

  // 5. Polygon geometry
  if (geom.includes("polygon")) {
    return (
      <div
        onClick={onClick}
        className={`
          relative flex shrink-0 items-center justify-center rounded-xl transition-transform
          ${onClick ? "cursor-pointer hover:scale-110" : ""}
          ${sizeClasses}
          ${className}
        `}
        style={{ backgroundColor: `${color}20` }}
        title="Polygon Layer"
      >
        <Square size={iconSizes} style={{ color }} />
      </div>
    );
  }

  // 6. Generic / Fallback
  return (
    <div
      onClick={onClick}
      className={`
        relative flex shrink-0 items-center justify-center rounded-xl bg-muted transition-transform
        ${onClick ? "cursor-pointer hover:scale-110" : ""}
        ${sizeClasses}
        ${className}
      `}
      style={{ backgroundColor: `${color}20` }}
      title="GIS Layer"
    >
      <Layers size={iconSizes} style={{ color }} />
    </div>
  );
}
