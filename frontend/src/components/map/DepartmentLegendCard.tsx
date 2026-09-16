"use client";

import { useMemo } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Layers,
  X,
  Maximize2,
  Building2,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useSpatialFilterStore } from "@/store/spatialFilterStore";

interface Props {
  departmentColors: Map<string, string>;
}

export default function DepartmentLegendCard({ departmentColors }: Props) {
  const map = useMap();
  const selectedDistrict = useSpatialFilterStore((s) => s.selectedDistrict);
  const selectedBlock = useSpatialFilterStore((s) => s.selectedBlock);
  const selectedPanchayat = useSpatialFilterStore((s) => s.selectedPanchayat);
  const selectedDepartment = useSpatialFilterStore((s) => s.selectedDepartment);
  const setDepartment = useSpatialFilterStore((s) => s.setDepartment);
  const resetFilter = useSpatialFilterStore((s) => s.resetFilter);
  const filteredAssets = useSpatialFilterStore((s) => s.filteredAssets);

  const isFilterActive = Boolean(
    selectedDistrict || selectedBlock || selectedPanchayat
  );

  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of filteredAssets) {
      const attrs = a.attributes || {};
      const dept =
        attrs.department_name ||
        attrs.department_display ||
        attrs.departme_1 ||
        "Other";
      counts[dept] = (counts[dept] || 0) + 1;
    }
    return counts;
  }, [filteredAssets]);

  const handleFitBounds = () => {
    const validCoords = filteredAssets
      .filter((a) => a.latitude && a.longitude)
      .map((a) => [a.latitude!, a.longitude!] as [number, number]);

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  };

  if (!isFilterActive) {
    return null;
  }

  return (
    <div className="leaflet-top leaflet-right pointer-events-none mt-14 mr-3 z-[1000]">
      <div className="pointer-events-auto w-80 max-w-[calc(100vw-32px)] rounded-2xl border border-border/80 bg-background/95 p-3.5 shadow-2xl backdrop-blur-xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Assets by Department
              </h4>
              <p className="text-[11px] text-muted-foreground font-medium">
                {filteredAssets.length}{" "}
                {filteredAssets.length === 1 ? "asset" : "assets"} found
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleFitBounds}
              title="Fit map to assets"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => resetFilter()}
              title="Clear active filter"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Breadcrumb path */}
        <div className="my-2.5 flex flex-wrap items-center gap-1 rounded-xl bg-muted/50 px-2.5 py-1.5 text-[11px] font-medium text-foreground">
          <MapPin className="h-3 w-3 text-primary shrink-0" />
          {selectedDistrict && (
            <span className="font-semibold text-primary">
              {selectedDistrict}
            </span>
          )}
          {selectedBlock && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <span>{selectedBlock}</span>
            </>
          )}
          {selectedPanchayat && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="rounded bg-primary/20 px-1 py-0.2 text-primary font-semibold">
                {selectedPanchayat}
              </span>
            </>
          )}
        </div>

        {/* Department Chips with counts */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold">
            <span>Filter Department:</span>
            {selectedDepartment && (
              <button
                onClick={() => setDepartment("")}
                className="text-primary hover:underline"
              >
                Show All
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => setDepartment("")}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-all ${
                !selectedDepartment
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/70 text-foreground hover:bg-muted"
              }`}
            >
              <span>All</span>
              <span className="rounded-full bg-background/30 px-1.5 py-0.2 text-[10px]">
                {filteredAssets.length}
              </span>
            </button>

            {Object.entries(deptCounts).map(([dept, count]) => {
              const color = departmentColors.get(dept) || "#64748b";
              const isSelected = selectedDepartment.toLowerCase() === dept.toLowerCase();
              return (
                <button
                  key={dept}
                  onClick={() =>
                    setDepartment(isSelected ? "" : dept)
                  }
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                      : "border-border/60 bg-background/80 hover:bg-muted/60 text-foreground"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate max-w-[120px]">{dept}</span>
                  <span
                    className="rounded-full px-1.5 py-0.2 text-[10px] font-bold"
                    style={{
                      backgroundColor: `${color}25`,
                      color: color,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
