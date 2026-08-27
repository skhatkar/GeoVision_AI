"use client";

import { useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getLayerSummary,
  getDatasetSummary,
  getProjectSummary,
  getLayerHealth,
  getDataQuality,
  getDuplicateAssets,
  getMissingGeometry,
  getInvalidCoordinates,
  getCrsCheck,
  getAttributeCompleteness,
  type LayerSummary,
  type DatasetSummary,
  type ProjectSummary,
  type LayerHealth,
  type DataQuality,
  type DuplicateResult,
  type MissingGeometryResult,
  type InvalidCoordinateResult,
  type CrsCheckResult,
  type AttributeCompletenessResult,
} from "@/api/aiApi";
import {
  Brain,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Database,
  FolderKanban,
  Activity,
  Shield,
  Users,
  MapPin,
  SlidersHorizontal,
  Hash,
  Loader2,
  Info,
  ChevronRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Score badge helper
// ─────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100) / 100;
  const color =
    pct >= 80 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
    : pct >= 50 ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
    : "bg-rose-500/15 text-rose-400 border-rose-500/20";
  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-sm font-semibold ${color}`}>
      {pct}%
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────
function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${
      ok ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
         : "bg-rose-500/10 text-rose-400 border-rose-500/20"
    }`}>
      {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Info row
// ─────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-2 last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium font-mono text-xs">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Result card wrapper
// ─────────────────────────────────────────────────────────────
function ResultCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <h3 className="flex items-center gap-2 font-semibold text-sm">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Issue list
// ─────────────────────────────────────────────────────────────
function IssueList({ issues }: { issues: string[] }) {
  if (!issues?.length) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-400">
        <CheckCircle2 size={14} />
        No issues detected
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {issues.map((issue, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 text-sm text-yellow-400">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          {issue}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Analysis panel (per entity type)
// ─────────────────────────────────────────────────────────────
type EntityType = "layer" | "dataset" | "project";

interface AnalysisState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAnalysis<T>(
  fn: (id: number) => Promise<T>
): [AnalysisState<T>, (id: number) => Promise<void>] {
  const [state, setState] = useState<AnalysisState<T>>({ data: null, loading: false, error: null });

  const run = useCallback(async (id: number) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await fn(id);
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : "Failed" });
    }
  }, [fn]);

  return [state, run];
}

// ─────────────────────────────────────────────────────────────
// Loading / Error states
// ─────────────────────────────────────────────────────────────
function LoadingCard() {
  return (
    <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-sm">
      <Loader2 size={16} className="animate-spin" />
      Running analysis…
    </div>
  );
}

function ErrorCard({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      <XCircle size={15} className="mt-0.5 shrink-0" />
      {msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Layer analysis panel
// ─────────────────────────────────────────────────────────────
function LayerAnalysisPanel({ layerId }: { layerId: number }) {
  const [summary, runSummary] = useAnalysis(getLayerSummary);
  const [health, runHealth] = useAnalysis(getLayerHealth);
  const [quality, runQuality] = useAnalysis(getDataQuality);
  const [duplicates, runDuplicates] = useAnalysis(getDuplicateAssets);
  const [missing, runMissing] = useAnalysis(getMissingGeometry);
  const [invalid, runInvalid] = useAnalysis(getInvalidCoordinates);
  const [crs, runCrs] = useAnalysis(getCrsCheck);
  const [attrs, runAttrs] = useAnalysis(getAttributeCompleteness);

  const analyses = [
    { label: "Summary", icon: <Info size={14} />, run: () => runSummary(layerId), state: summary },
    { label: "Health", icon: <Activity size={14} />, run: () => runHealth(layerId), state: health },
    { label: "Quality", icon: <Shield size={14} />, run: () => runQuality(layerId), state: quality },
    { label: "Duplicates", icon: <Users size={14} />, run: () => runDuplicates(layerId), state: duplicates },
    { label: "Missing Geometry", icon: <MapPin size={14} />, run: () => runMissing(layerId), state: missing },
    { label: "Invalid Coords", icon: <XCircle size={14} />, run: () => runInvalid(layerId), state: invalid },
    { label: "CRS Check", icon: <SlidersHorizontal size={14} />, run: () => runCrs(layerId), state: crs },
    { label: "Attributes", icon: <Hash size={14} />, run: () => runAttrs(layerId), state: attrs },
  ];

  return (
    <div className="space-y-4">
      {/* Run all button */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          onClick={() => analyses.forEach(a => a.run())}
          className="gap-1.5"
        >
          <Play size={12} />
          Run All
        </Button>
        <p className="text-xs text-muted-foreground">Or run individual checks below</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Summary */}
        <ResultCard title="Layer Summary" icon={<Info size={14} className="text-blue-400" />}>
          <Button size="sm" variant="outline" onClick={() => runSummary(layerId)} disabled={summary.loading} className="gap-1.5 w-full">
            {summary.loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Run
          </Button>
          {summary.loading && <LoadingCard />}
          {summary.error && <ErrorCard msg={summary.error} />}
          {summary.data && (
            <div>
              <InfoRow label="Name" value={(summary.data as LayerSummary).name} />
              <InfoRow label="Geometry" value={(summary.data as LayerSummary).geometry_type} />
              <InfoRow label="Features" value={(summary.data as LayerSummary).feature_count?.toLocaleString("en-IN")} />
              <InfoRow label="CRS" value={(summary.data as LayerSummary).crs ?? "—"} />
              <InfoRow label="Attributes" value={((summary.data as LayerSummary).attributes ?? []).length} />
            </div>
          )}
        </ResultCard>

        {/* Health */}
        <ResultCard title="Layer Health" icon={<Activity size={14} className="text-emerald-400" />}>
          <Button size="sm" variant="outline" onClick={() => runHealth(layerId)} disabled={health.loading} className="gap-1.5 w-full">
            {health.loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Run
          </Button>
          {health.loading && <LoadingCard />}
          {health.error && <ErrorCard msg={health.error} />}
          {health.data && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Health Score</span>
                <ScoreBadge score={(health.data as LayerHealth).health_score} />
              </div>
              <IssueList issues={(health.data as LayerHealth).issues} />
            </div>
          )}
        </ResultCard>

        {/* Data Quality */}
        <ResultCard title="Data Quality" icon={<Shield size={14} className="text-violet-400" />}>
          <Button size="sm" variant="outline" onClick={() => runQuality(layerId)} disabled={quality.loading} className="gap-1.5 w-full">
            {quality.loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Run
          </Button>
          {quality.loading && <LoadingCard />}
          {quality.error && <ErrorCard msg={quality.error} />}
          {quality.data && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Quality Score</span>
                <ScoreBadge score={(quality.data as DataQuality).quality_score} />
              </div>
              <IssueList issues={(quality.data as DataQuality).issues} />
            </div>
          )}
        </ResultCard>

        {/* Duplicates */}
        <ResultCard title="Duplicate Assets" icon={<Users size={14} className="text-orange-400" />}>
          <Button size="sm" variant="outline" onClick={() => runDuplicates(layerId)} disabled={duplicates.loading} className="gap-1.5 w-full">
            {duplicates.loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Run
          </Button>
          {duplicates.loading && <LoadingCard />}
          {duplicates.error && <ErrorCard msg={duplicates.error} />}
          {duplicates.data && (
            <div className="space-y-2">
              <StatusBadge
                ok={(duplicates.data as DuplicateResult).duplicate_count === 0}
                label={`${(duplicates.data as DuplicateResult).duplicate_count} duplicate(s) found`}
              />
            </div>
          )}
        </ResultCard>

        {/* Missing Geometry */}
        <ResultCard title="Missing Geometry" icon={<MapPin size={14} className="text-sky-400" />}>
          <Button size="sm" variant="outline" onClick={() => runMissing(layerId)} disabled={missing.loading} className="gap-1.5 w-full">
            {missing.loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Run
          </Button>
          {missing.loading && <LoadingCard />}
          {missing.error && <ErrorCard msg={missing.error} />}
          {missing.data && (
            <StatusBadge
              ok={(missing.data as MissingGeometryResult).missing_count === 0}
              label={`${(missing.data as MissingGeometryResult).missing_count} missing geometry`}
            />
          )}
        </ResultCard>

        {/* Invalid Coordinates */}
        <ResultCard title="Invalid Coordinates" icon={<XCircle size={14} className="text-rose-400" />}>
          <Button size="sm" variant="outline" onClick={() => runInvalid(layerId)} disabled={invalid.loading} className="gap-1.5 w-full">
            {invalid.loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Run
          </Button>
          {invalid.loading && <LoadingCard />}
          {invalid.error && <ErrorCard msg={invalid.error} />}
          {invalid.data && (
            <StatusBadge
              ok={(invalid.data as InvalidCoordinateResult).invalid_count === 0}
              label={`${(invalid.data as InvalidCoordinateResult).invalid_count} invalid coordinate(s)`}
            />
          )}
        </ResultCard>

        {/* CRS Check */}
        <ResultCard title="CRS Check" icon={<SlidersHorizontal size={14} className="text-cyan-400" />}>
          <Button size="sm" variant="outline" onClick={() => runCrs(layerId)} disabled={crs.loading} className="gap-1.5 w-full">
            {crs.loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Run
          </Button>
          {crs.loading && <LoadingCard />}
          {crs.error && <ErrorCard msg={crs.error} />}
          {crs.data && (
            <div className="space-y-2">
              <InfoRow label="CRS" value={(crs.data as CrsCheckResult).crs ?? "—"} />
              <div className="flex gap-2">
                <StatusBadge ok={(crs.data as CrsCheckResult).is_geographic} label="Geographic" />
                <StatusBadge ok={(crs.data as CrsCheckResult).is_projected} label="Projected" />
              </div>
              <IssueList issues={(crs.data as CrsCheckResult).issues} />
            </div>
          )}
        </ResultCard>

        {/* Attribute Completeness */}
        <ResultCard title="Attribute Completeness" icon={<Hash size={14} className="text-yellow-400" />}>
          <Button size="sm" variant="outline" onClick={() => runAttrs(layerId)} disabled={attrs.loading} className="gap-1.5 w-full">
            {attrs.loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Run
          </Button>
          {attrs.loading && <LoadingCard />}
          {attrs.error && <ErrorCard msg={attrs.error} />}
          {attrs.data && (
            <div className="space-y-2">
              {Object.entries((attrs.data as AttributeCompletenessResult).completeness ?? {}).slice(0, 8).map(([field, pct]) => (
                <div key={field} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate">{field}</span>
                    <span className="font-semibold">{Math.round(Number(pct))}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.min(100, Number(pct))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ResultCard>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function AIPage() {
  const [entityType, setEntityType] = useState<EntityType>("layer");
  const [entityId, setEntityId] = useState("");

  const parsedId = parseInt(entityId, 10);
  const isValidId = !isNaN(parsedId) && parsedId > 0;

  return (
    <AppShell>
      <PageHeader
        title="GeoVision AI"
        subtitle="AI-powered spatial data intelligence and quality analysis"
      />

      {/* Entity selector */}
      <div className="mb-8 rounded-2xl border bg-card p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Entity Type</label>
            <Tabs value={entityType} onValueChange={(v) => { setEntityType(v as EntityType); setEntityId(""); }}>
              <TabsList>
                <TabsTrigger value="layer" className="gap-1.5">
                  <Layers size={13} /> Layer
                </TabsTrigger>
                <TabsTrigger value="dataset" className="gap-1.5">
                  <Database size={13} /> Dataset
                </TabsTrigger>
                <TabsTrigger value="project" className="gap-1.5">
                  <FolderKanban size={13} /> Project
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {entityType === "layer" ? "Layer" : entityType === "dataset" ? "Dataset" : "Project"} ID
            </label>
            <Input
              type="number"
              placeholder="Enter ID…"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="w-48"
              min={1}
            />
          </div>

          {isValidId && entityType !== "layer" && (
            <div className="space-y-1.5">
              <QuickSummaryButton entityType={entityType} id={parsedId} />
            </div>
          )}
        </div>

        {!isValidId && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info size={12} />
            Enter a valid numeric ID to run AI analysis. Find IDs in the Layers, Datasets, or Projects pages.
          </p>
        )}
      </div>

      {/* Analysis panels */}
      {isValidId && entityType === "layer" && (
        <LayerAnalysisPanel key={parsedId} layerId={parsedId} />
      )}

      {isValidId && entityType === "dataset" && (
        <DatasetAnalysisPanel datasetId={parsedId} />
      )}

      {isValidId && entityType === "project" && (
        <ProjectAnalysisPanel projectId={parsedId} />
      )}

      {!isValidId && (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-24 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Brain size={36} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold">AI Analysis Ready</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Select an entity type and enter an ID above to run comprehensive AI-powered data quality analysis.
          </p>
        </div>
      )}
    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Quick summary button (dataset/project only)
// ─────────────────────────────────────────────────────────────
function QuickSummaryButton({ entityType, id }: { entityType: EntityType; id: number }) {
  return null; // placeholder
}

// ─────────────────────────────────────────────────────────────
// Dataset analysis panel
// ─────────────────────────────────────────────────────────────
function DatasetAnalysisPanel({ datasetId }: { datasetId: number }) {
  const [summary, runSummary] = useAnalysis(getDatasetSummary);

  return (
    <div className="space-y-4">
      <ResultCard title="Dataset Summary" icon={<Database size={14} className="text-emerald-400" />}>
        <Button onClick={() => runSummary(datasetId)} disabled={summary.loading} className="gap-2">
          {summary.loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          Run Summary
        </Button>
        {summary.loading && <LoadingCard />}
        {summary.error && <ErrorCard msg={summary.error} />}
        {summary.data && (
          <div>
            <InfoRow label="Name" value={(summary.data as DatasetSummary).name} />
            <InfoRow label="File Type" value={(summary.data as DatasetSummary).file_type} />
            <InfoRow label="Geometry" value={(summary.data as DatasetSummary).geometry_type ?? "—"} />
            <InfoRow label="Features" value={(summary.data as DatasetSummary).feature_count?.toLocaleString("en-IN")} />
            <InfoRow label="Layers" value={(summary.data as DatasetSummary).layers} />
            <InfoRow label="CRS" value={(summary.data as DatasetSummary).crs ?? "—"} />
          </div>
        )}
      </ResultCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Project analysis panel
// ─────────────────────────────────────────────────────────────
function ProjectAnalysisPanel({ projectId }: { projectId: number }) {
  const [summary, runSummary] = useAnalysis(getProjectSummary);

  return (
    <div className="space-y-4">
      <ResultCard title="Project Summary" icon={<FolderKanban size={14} className="text-orange-400" />}>
        <Button onClick={() => runSummary(projectId)} disabled={summary.loading} className="gap-2">
          {summary.loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          Run Summary
        </Button>
        {summary.loading && <LoadingCard />}
        {summary.error && <ErrorCard msg={summary.error} />}
        {summary.data && (
          <div>
            <InfoRow label="Name" value={(summary.data as ProjectSummary).name} />
            <InfoRow label="Datasets" value={(summary.data as ProjectSummary).datasets} />
            <InfoRow label="Layers" value={(summary.data as ProjectSummary).layers} />
            <InfoRow label="Assets" value={(summary.data as ProjectSummary).assets?.toLocaleString("en-IN")} />
          </div>
        )}
      </ResultCard>
    </div>
  );
}
