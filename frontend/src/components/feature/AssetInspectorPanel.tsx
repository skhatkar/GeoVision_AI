"use client";

import { useMemo } from "react";
import {
  MapPin,
  Building2,
  Phone,
  Mail,
  Building,
  Hash,
  ChevronRight,
  Layers,
  LocateFixed,
  AlertCircle,
  Database,
  Download,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";
import { useSpatialFilterStore } from "@/store/spatialFilterStore";
import type { FilteredAsset } from "@/api/assetApi";
import {
  exportAssetsToCSV,
  exportAssetsToGeoJSON,
  exportAssetsToJSON,
  generateExportFilename,
} from "@/lib/exportUtils";

// ─── Department colors ───────────────────────────────────────────────────────
const KNOWN_DEPARTMENT_COLORS: Record<string, string> = {
  "POLICE DEPARTMENT": "#1d4ed8",
  "Police": "#1d4ed8",
  "Police & Home Affairs": "#1d4ed8",
  "AYUSH": "#059669",
  "DIRECTORATE OF HEALTH": "#e11d48",
  "Health & Family Welfare": "#e11d48",
  "FOREST CORPORATION": "#15803d",
  "Forest & Environment": "#15803d",
  "PANCHAYATI RAJ": "#d97706",
  "ELECTION": "#7c3aed",
  "Election Department": "#7c3aed",
  "DIRECTORATE OF PRISONS": "#ea580c",
  "STATE VIGILANCE BUREAU": "#0891b2",
  "TECHNICAL EDUCATION,VOCATIONAL": "#9333ea",
  "FISHERIES": "#0284c7",
  "PUBLIC WORKS": "#ca8a04",
  "RURAL DEVELOPMENT": "#16a34a",
  "INDUSTRIES": "#475569",
  "State Excise Commissioner": "#dc2626",
  "ENVIRONMENT, SCIENCE": "#10b981",
  "DD&TG": "#6366f1",
  "HP TAKNIKI SHIKSHA BOARD": "#8b5cf6",
  "DIRECTORATE OF WOMEN & CHILD": "#db2777",
  "ECONOMICS AND STATISTICS": "#4f46e5",
};
const FALLBACK_PALETTE = ["#2563eb","#059669","#dc2626","#d97706","#7c3aed","#0891b2","#db2777","#4f46e5","#ea580c","#16a34a"];

function getDeptColor(dept: string, fallbackMap: Map<string, string>): string {
  return KNOWN_DEPARTMENT_COLORS[dept] ?? fallbackMap.get(dept) ?? "#6366f1";
}

function safeStr(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s.length > 0 && s !== "—" ? s : null;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null;
  icon?: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-border/30 last:border-0">
      {icon && <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xs font-semibold text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 overflow-hidden">
      <div className="px-3 py-2 bg-muted/30 border-b border-border/40">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      </div>
      <div className="px-3 py-1">{children}</div>
    </div>
  );
}

// ─── List item ────────────────────────────────────────────────────────────────
function AssetListItem({
  asset,
  color,
  isSelected,
  onClick,
}: {
  asset: FilteredAsset;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const attrs = asset.attributes || {};
  const name = safeStr(attrs.asset_name || attrs.office_name || asset.name) ?? "Govt Asset";
  const assetType = safeStr(attrs.asset_type_name || attrs.asset_ty_1);
  const panchayat = safeStr(attrs.panchayat_lgd_name || attrs.panchayat1);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-2.5 transition-all cursor-pointer flex items-start gap-2.5 ${
        isSelected
          ? "border-primary/60 bg-primary/5 shadow-sm"
          : "border-border/40 bg-card/50 hover:border-border hover:bg-muted/30"
      }`}
    >
      <span
        className="mt-1 h-2.5 w-2.5 rounded-full shrink-0 shadow-sm ring-1 ring-white/30"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground truncate leading-tight">{name}</p>
        {assetType && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{assetType}</p>}
        {panchayat && <p className="text-[9px] text-muted-foreground/70 mt-0.5 truncate">📍 {panchayat}</p>}
      </div>
      <ChevronRight
        size={13}
        className={`mt-0.5 shrink-0 transition-transform ${isSelected ? "text-primary rotate-90" : "text-muted-foreground/50"}`}
      />
    </button>
  );
}

// ─── Detail view ──────────────────────────────────────────────────────────────
function AssetDetail({ asset, onBack, color }: { asset: FilteredAsset; onBack: () => void; color: string }) {
  const attrs = asset.attributes || {};
  const dept = safeStr(attrs.department_name || attrs.department_display || attrs.departme_1) ?? "General";
  const name = safeStr(attrs.asset_name || attrs.office_name || asset.name) ?? "Govt Asset";
  const assetType = safeStr(attrs.asset_type_name || attrs.asset_ty_1);
  const area = safeStr(attrs.asset_area);
  const address = safeStr(attrs.asset_address || attrs.asset_addr);
  const village = safeStr(attrs.village_lgd_name || attrs.village__1);
  const panchayat = safeStr(attrs.panchayat_lgd_name || attrs.panchayat1);
  const block = safeStr(attrs.block_lgd_name || attrs.block_lgd1);
  const district = safeStr(attrs.district_lgd_name || attrs.district_1);
  const email = safeStr(attrs.official_email || attrs.official_e);
  const phone = safeStr(attrs.mobile_number || attrs.mobile_num);
  const ownership = safeStr(attrs.ownership_type || attrs.ownership_);
  const status = safeStr(attrs.asset_status);
  const pincode = safeStr(attrs.pincode);

  const DISPLAYED_KEYS = new Set([
    "department_name","department_display","departme_1","asset_name","office_name",
    "asset_type_name","asset_ty_1","asset_area","asset_address","asset_addr",
    "village_lgd_name","village__1","panchayat_lgd_name","panchayat1",
    "block_lgd_name","block_lgd1","district_lgd_name","district_1",
    "official_email","official_e","mobile_number","mobile_num",
    "ownership_type","ownership_","asset_status","pincode",
  ]);
  const extraFields = Object.entries(attrs).filter(
    ([k, v]) => !DISPLAYED_KEYS.has(k) && v !== null && v !== undefined && String(v).trim().length > 0
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ChevronRight size={12} className="rotate-180" />
          Back to list
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => exportAssetsToCSV([asset], `asset_${asset.id}.csv`)}
            title="Export asset as CSV"
            className="flex items-center gap-1 text-[10px] font-semibold bg-muted/60 hover:bg-muted text-foreground px-2 py-1 rounded border border-border/50 transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={11} className="text-emerald-500" />
            CSV
          </button>
          <button
            type="button"
            onClick={() => exportAssetsToGeoJSON([asset], `asset_${asset.id}.geojson`)}
            title="Export asset as GeoJSON"
            className="flex items-center gap-1 text-[10px] font-semibold bg-muted/60 hover:bg-muted text-foreground px-2 py-1 rounded border border-border/50 transition-colors cursor-pointer"
          >
            <Download size={11} className="text-sky-500" />
            GeoJSON
          </button>
          <button
            type="button"
            onClick={() => exportAssetsToJSON([asset], `asset_${asset.id}.json`)}
            title="Export asset as JSON"
            className="flex items-center gap-1 text-[10px] font-semibold bg-muted/60 hover:bg-muted text-foreground px-2 py-1 rounded border border-border/50 transition-colors cursor-pointer"
          >
            <FileCode size={11} className="text-amber-500" />
            JSON
          </button>
        </div>
      </div>

      {/* Department header */}
      <div
        className="rounded-xl p-3.5 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}ee, ${color}88)` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1">{dept}</p>
            <h3 className="font-bold text-sm leading-tight">{name}</h3>
            {assetType && (
              <p className="text-[11px] opacity-80 mt-1 flex items-center gap-1.5">
                <Building size={10} />
                {assetType}
              </p>
            )}
          </div>
          {area && (
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
              {area}
            </span>
          )}
        </div>
        <div className="absolute -bottom-5 -right-5 h-20 w-20 rounded-full bg-white/10" />
      </div>

      {/* GPS */}
      {asset.latitude !== null && asset.longitude !== null && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/40">
          <LocateFixed size={13} className="text-primary shrink-0" />
          <span className="font-mono font-semibold">
            {asset.latitude!.toFixed(6)}, {asset.longitude!.toFixed(6)}
          </span>
        </div>
      )}

      {/* Address */}
      {(address || pincode) && (
        <Section title="Address">
          <InfoRow label="Full Address" value={address} icon={<MapPin size={12} />} />
          <InfoRow label="PIN Code" value={pincode} icon={<Hash size={12} />} />
        </Section>
      )}

      {/* Admin hierarchy */}
      <Section title="Administrative Boundary">
        <InfoRow label="District" value={district} icon={<Layers size={12} />} />
        <InfoRow label="Block" value={block} />
        <InfoRow label="Panchayat" value={panchayat} />
        <InfoRow label="Village" value={village} icon={<MapPin size={12} />} />
      </Section>

      {/* Asset details */}
      <Section title="Asset Details">
        <InfoRow label="Asset Type" value={assetType} icon={<Building2 size={12} />} />
        <InfoRow label="Ownership" value={ownership} icon={<Database size={12} />} />
        <InfoRow label="Status" value={status} icon={<AlertCircle size={12} />} />
        <InfoRow label="Area" value={area} />
      </Section>

      {/* Contact */}
      {(phone || email) && (
        <Section title="Contact Info">
          {phone && (
            <div className="py-1.5 border-b border-border/30">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Phone</p>
              <a href={`tel:${phone}`} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                <Phone size={11} />{phone}
              </a>
            </div>
          )}
          {email && (
            <div className="py-1.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
              <a href={`mailto:${email}`} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 break-all">
                <Mail size={11} className="shrink-0" />{email}
              </a>
            </div>
          )}
        </Section>
      )}

      {/* Extra raw fields */}
      {extraFields.length > 0 && (
        <Section title={`All Fields (${extraFields.length})`}>
          {extraFields.map(([key, val]) => (
            <InfoRow key={key} label={key.replace(/_/g, " ")} value={String(val)} />
          ))}
        </Section>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function AssetInspectorPanel() {
  const filteredAssets = useSpatialFilterStore((s) => s.filteredAssets);
  const selectedAsset = useSpatialFilterStore((s) => s.selectedAsset);
  const setSelectedAsset = useSpatialFilterStore((s) => s.setSelectedAsset);
  const selectedDistrict = useSpatialFilterStore((s) => s.selectedDistrict);
  const selectedBlock = useSpatialFilterStore((s) => s.selectedBlock);
  const selectedPanchayat = useSpatialFilterStore((s) => s.selectedPanchayat);
  const selectedDepartment = useSpatialFilterStore((s) => s.selectedDepartment);
  const isFilterActive = useSpatialFilterStore(
    (s) => Boolean(s.selectedDistrict || s.selectedBlock || s.selectedPanchayat)
  );
  const loadingAssets = useSpatialFilterStore((s) => s.loadingAssets);

  // Build per-department color map
  const departmentColors = useMemo(() => {
    const fallbackMap = new Map<string, string>();
    let idx = 0;
    for (const asset of filteredAssets) {
      const attrs = asset.attributes || {};
      const dept = attrs.department_name || attrs.department_display || attrs.departme_1 || "General";
      if (!fallbackMap.has(dept) && !KNOWN_DEPARTMENT_COLORS[dept]) {
        fallbackMap.set(dept, FALLBACK_PALETTE[idx++ % FALLBACK_PALETTE.length]);
      }
    }
    return fallbackMap;
  }, [filteredAssets]);

  const displayedAssets = useMemo(() => {
    if (!isFilterActive) return [];
    return filteredAssets.filter((asset) => {
      if (!selectedDepartment) return true;
      const attrs = asset.attributes || {};
      const dept = attrs.department_name || attrs.department_display || attrs.departme_1 || "General";
      return dept.toLowerCase() === selectedDepartment.toLowerCase();
    });
  }, [filteredAssets, isFilterActive, selectedDepartment]);

  if (loadingAssets) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Loading assets…</p>
      </div>
    );
  }

  if (!isFilterActive) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center px-4">
        <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center">
          <Layers size={18} className="text-muted-foreground/60" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">No filter applied</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Select a District, Block, or Panchayat from the left panel to load assets.
          </p>
        </div>
      </div>
    );
  }

  if (displayedAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center px-4">
        <AlertCircle size={24} className="text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">No assets found for the selected filters.</p>
      </div>
    );
  }

  // Detail view
  if (selectedAsset) {
    const attrs = selectedAsset.attributes || {};
    const dept = attrs.department_name || attrs.department_display || attrs.departme_1 || "General";
    const color = getDeptColor(dept, departmentColors);
    return <AssetDetail asset={selectedAsset} onBack={() => setSelectedAsset(null)} color={color} />;
  }

  // List view
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-0.5 pb-1 border-b border-border/40">
        <p className="text-[11px] text-muted-foreground font-medium truncate">
          {displayedAssets.length} asset{displayedAssets.length !== 1 ? "s" : ""} found
          {selectedDepartment ? ` · ${selectedDepartment}` : ""}
        </p>

        {/* Export options */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              const fname = generateExportFilename(selectedDistrict, selectedBlock, selectedPanchayat, selectedDepartment, "csv");
              exportAssetsToCSV(displayedAssets, fname);
            }}
            className="flex items-center gap-1 rounded bg-muted/60 hover:bg-muted border border-border/50 px-1.5 py-0.5 text-[10px] font-semibold text-foreground transition-colors cursor-pointer"
            title="Export list to CSV"
          >
            <FileSpreadsheet size={11} className="text-emerald-500" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const fname = generateExportFilename(selectedDistrict, selectedBlock, selectedPanchayat, selectedDepartment, "geojson");
              exportAssetsToGeoJSON(displayedAssets, fname);
            }}
            className="flex items-center gap-1 rounded bg-muted/60 hover:bg-muted border border-border/50 px-1.5 py-0.5 text-[10px] font-semibold text-foreground transition-colors cursor-pointer"
            title="Export list to GeoJSON"
          >
            <Download size={11} className="text-sky-500" />
            <span>GeoJSON</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const fname = generateExportFilename(selectedDistrict, selectedBlock, selectedPanchayat, selectedDepartment, "json");
              exportAssetsToJSON(displayedAssets, fname);
            }}
            className="flex items-center gap-1 rounded bg-muted/60 hover:bg-muted border border-border/50 px-1.5 py-0.5 text-[10px] font-semibold text-foreground transition-colors cursor-pointer"
            title="Export list to JSON"
          >
            <FileCode size={11} className="text-amber-500" />
            <span>JSON</span>
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        {displayedAssets.map((asset) => {
          const attrs = asset.attributes || {};
          const dept = attrs.department_name || attrs.department_display || attrs.departme_1 || "General";
          const color = getDeptColor(dept, departmentColors);
          return (
            <AssetListItem
              key={asset.id}
              asset={asset}
              color={color}
              isSelected={(selectedAsset as FilteredAsset | null)?.id === asset.id}
              onClick={() => setSelectedAsset(asset)}
            />
          );
        })}
      </div>
    </div>
  );
}
