"use client";

import { useEffect, useMemo } from "react";
import { CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Building2,
  Phone,
  Mail,
  Compass,
  Building,
  Navigation,
} from "lucide-react";
import { useSpatialFilterStore } from "@/store/spatialFilterStore";
import DepartmentLegendCard from "./DepartmentLegendCard";



const KNOWN_DEPARTMENT_COLORS: Record<string, string> = {
  "POLICE DEPARTMENT": "#1d4ed8", // vibrant blue
  "Police": "#1d4ed8",
  "Police & Home Affairs": "#1d4ed8",
  "AYUSH": "#059669", // emerald green
  "DIRECTORATE OF HEALTH": "#e11d48", // crimson rose
  "Health & Family Welfare": "#e11d48",
  "FOREST CORPORATION": "#15803d", // forest green
  "Forest & Environment": "#15803d",
  "PANCHAYATI RAJ": "#d97706", // amber orange
  "ELECTION": "#7c3aed", // violet purple
  "Election Department": "#7c3aed",
  "DIRECTORATE OF PRISONS": "#ea580c", // deep orange
  "STATE VIGILANCE BUREAU": "#0891b2", // cyan teal
  "TECHNICAL EDUCATION,VOCATIONAL": "#9333ea", // purple
  "FISHERIES": "#0284c7", // ocean blue
  "PUBLIC WORKS": "#ca8a04", // gold yellow
  "RURAL DEVELOPMENT": "#16a34a", // vibrant green
  "INDUSTRIES": "#475569", // slate steel
  "State Excise Commissioner": "#dc2626", // red
  "ENVIRONMENT, SCIENCE": "#10b981", // mint green
  "DD&TG": "#6366f1", // indigo
  "HP TAKNIKI SHIKSHA BOARD": "#8b5cf6", // soft violet
  "DIRECTORATE OF WOMEN & CHILD": "#db2777", // pink
  "ECONOMICS AND STATISTICS": "#4f46e5", // royal indigo
};

const FALLBACK_PALETTE = [
  "#2563eb",
  "#059669",
  "#dc2626",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#4f46e5",
  "#ea580c",
  "#16a34a",
];

function safeStr(val: unknown): string {
  if (val === null || val === undefined) return "—";
  const s = String(val).trim();
  return s.length > 0 ? s : "—";
}

export default function PanchayatAssetMarkers() {
  const map = useMap();
  const filteredAssets = useSpatialFilterStore((state) => state.filteredAssets);
  const selectedDistrict = useSpatialFilterStore((state) => state.selectedDistrict);
  const selectedBlock = useSpatialFilterStore((state) => state.selectedBlock);
  const selectedPanchayat = useSpatialFilterStore((state) => state.selectedPanchayat);
  const selectedDepartment = useSpatialFilterStore((state) => state.selectedDepartment);
  const setSelectedAsset = useSpatialFilterStore((state) => state.setSelectedAsset);

  const isFilterActive = Boolean(
    selectedDistrict || selectedBlock || selectedPanchayat
  );

  // Dynamic department color mapping
  const departmentColors = useMemo(() => {
    const mapColors = new Map<string, string>();
    let fallbackIdx = 0;

    for (const asset of filteredAssets) {
      const attrs = asset.attributes || {};
      const dept =
        attrs.department_name ||
        attrs.department_display ||
        attrs.departme_1 ||
        "General";

      if (!mapColors.has(dept)) {
        if (KNOWN_DEPARTMENT_COLORS[dept]) {
          mapColors.set(dept, KNOWN_DEPARTMENT_COLORS[dept]);
        } else {
          mapColors.set(dept, FALLBACK_PALETTE[fallbackIdx % FALLBACK_PALETTE.length]);
          fallbackIdx++;
        }
      }
    }
    return mapColors;
  }, [filteredAssets]);

  // Filtered by selected department if toggled in legend
  const displayedAssets = useMemo(() => {
    if (!isFilterActive) return [];
    return filteredAssets.filter((asset) => {
      if (asset.latitude === null || asset.longitude === null) return false;
      if (!selectedDepartment) return true;
      const attrs = asset.attributes || {};
      const dept =
        attrs.department_name ||
        attrs.department_display ||
        attrs.departme_1 ||
        "General";
      return dept.toLowerCase() === selectedDepartment.toLowerCase();
    });
  }, [filteredAssets, isFilterActive, selectedDepartment]);

  // Smooth fit bounds when assets or admin boundaries change
  useEffect(() => {
    if (displayedAssets.length === 0) return;
    const coords = displayedAssets.map(
      (a) => [a.latitude!, a.longitude!] as [number, number]
    );
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  }, [map, displayedAssets]);

  if (!isFilterActive || displayedAssets.length === 0) {
    return isFilterActive ? (
      <DepartmentLegendCard departmentColors={departmentColors} />
    ) : null;
  }

  return (
    <>
      <DepartmentLegendCard departmentColors={departmentColors} />

      {displayedAssets.map((asset) => {
        const attrs = asset.attributes || {};
        const dept =
          attrs.department_name ||
          attrs.department_display ||
          attrs.departme_1 ||
          "General";
        const color = departmentColors.get(dept) || "#2563eb";
        const name = attrs.asset_name || attrs.office_name || asset.name || "Govt Asset";
        const address = attrs.asset_address || attrs.asset_addr;
        const village = attrs.village_lgd_name || attrs.village__1;
        const panchayat = attrs.panchayat_lgd_name || attrs.panchayat1;
        const block = attrs.block_lgd_name || attrs.block_lgd1;
        const district = attrs.district_lgd_name || attrs.district_1;
        const email = attrs.official_email || attrs.official_e;
        const phone = attrs.mobile_number || attrs.mobile_num;
        const assetType = attrs.asset_type_name || attrs.asset_ty_1;
        const area = attrs.asset_area;

        return (
          <CircleMarker
            key={asset.id}
            center={[asset.latitude!, asset.longitude!]}
            radius={9}
            pathOptions={{
              color: "#ffffff",
              weight: 2.5,
              fillColor: color,
              fillOpacity: 0.92,
            }}
            eventHandlers={{
              click: () => setSelectedAsset(asset),
            }}
          >
            <Popup className="geovision-asset-popup" minWidth={260} maxWidth={320}>
              <div className="p-1 text-xs text-foreground font-sans">
                {/* Department Header Badge */}
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/70">
                  <span
                    className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                    }}
                  >
                    {dept}
                  </span>
                  {area && (
                    <span className="ml-auto text-[9px] font-semibold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                      {area}
                    </span>
                  )}
                </div>

                {/* Asset Title */}
                <h3 className="font-bold text-sm text-foreground leading-snug mb-1">
                  {name}
                </h3>

                {assetType && (
                  <p className="text-[11px] text-muted-foreground font-medium mb-2.5 flex items-center gap-1.5">
                    <Building className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                    <span>{assetType}</span>
                  </p>
                )}

                {/* Address */}
                {address && (
                  <div className="rounded-lg bg-muted/40 p-2 mb-2 border border-border/50">
                    <div className="flex items-start gap-1.5 text-[11px] text-foreground leading-relaxed">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{address}</span>
                    </div>
                  </div>
                )}

                {/* Admin Boundary Hierarchy Details */}
                <div className="grid grid-cols-2 gap-1 py-1 text-[10px] bg-background rounded-lg border border-border/40 p-1.5 mb-2">
                  <div>
                    <span className="text-muted-foreground">District:</span>
                    <span className="font-semibold text-foreground ml-1">
                      {safeStr(district)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Block:</span>
                    <span className="font-semibold text-foreground ml-1">
                      {safeStr(block)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Panchayat:</span>
                    <span className="font-semibold text-foreground ml-1">
                      {safeStr(panchayat)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Village:</span>
                    <span className="font-semibold text-foreground ml-1">
                      {safeStr(village)}
                    </span>
                  </div>
                </div>

                {/* Coordinates & Contact */}
                <div className="space-y-1 text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Compass className="h-3 w-3" />
                      {asset.latitude!.toFixed(5)}, {asset.longitude!.toFixed(5)}
                    </span>
                  </div>

                  {(phone || email) && (
                    <div className="flex items-center gap-3 pt-1 font-medium">
                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{phone}</span>
                        </a>
                      )}
                      {email && (
                        <a
                          href={`mailto:${email}`}
                          className="flex items-center gap-1 text-primary hover:underline truncate max-w-[150px]"
                          title={email}
                        >
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{email}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
