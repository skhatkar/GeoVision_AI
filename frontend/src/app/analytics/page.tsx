"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  getAssetsByLayer,
  getAssetsByDepartment,
  getAssetsByGeometry,
  getProjectProgress,
  getUploadTrends,
  getStorageUsage,
  getTopLayers,
  getTopProjects,
  type NameValueItem,
  type UploadTrendItem,
  type StorageUsageItem,
  type ProjectProgressItem,
} from "@/api/analyticsApi";
import {
  RefreshCw,
  BarChart2,
  TrendingUp,
  PieChart as PieIcon,
  HardDrive,
  Sparkles,
  FolderKanban,
  Shapes,
} from "lucide-react";

// Curated harmonious color palette
const COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B",
  "#EC4899", "#06B6D4", "#84CC16", "#6366F1",
];

// Custom Tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md px-3.5 py-2.5 shadow-xl text-xs space-y-1">
      {label && <p className="font-semibold text-foreground">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full inline-block" style={{ background: p.color ?? p.fill }} />
          <span>{p.name}:</span>
          <span className="font-bold font-mono text-foreground">
            {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// Loading Skeleton
function ChartSkeleton() {
  return <div className="h-64 animate-pulse rounded-2xl bg-muted/60" />;
}

// Empty State Card
function EmptyChart({ message = "No data available" }: { message?: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center text-center p-4">
      <BarChart2 size={32} className="mb-2 text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}

// Progress Bar
function ProgressBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.min(100, Math.round((value / safeMax) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="truncate font-medium text-foreground max-w-[200px]">{label}</span>
        <span className="shrink-0 font-bold font-mono text-muted-foreground">
          {value.toLocaleString("en-IN")}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 shadow-xs"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [byLayer, setByLayer] = useState<NameValueItem[]>([]);
  const [byDept, setByDept] = useState<NameValueItem[]>([]);
  const [byGeom, setByGeom] = useState<NameValueItem[]>([]);
  const [trends, setTrends] = useState<UploadTrendItem[]>([]);
  const [storage, setStorage] = useState<StorageUsageItem[]>([]);
  const [progress, setProgress] = useState<ProjectProgressItem[]>([]);
  const [topLayers, setTopLayers] = useState<NameValueItem[]>([]);
  const [topProjects, setTopProjects] = useState<NameValueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bl, bd, bg, tr, st, pr, tl, tp] = await Promise.allSettled([
        getAssetsByLayer(),
        getAssetsByDepartment(),
        getAssetsByGeometry(),
        getUploadTrends(),
        getStorageUsage(),
        getProjectProgress(),
        getTopLayers(),
        getTopProjects(),
      ]);

      if (bl.status === "fulfilled" && Array.isArray(bl.value)) setByLayer(bl.value);
      if (bd.status === "fulfilled" && Array.isArray(bd.value)) setByDept(bd.value);
      if (bg.status === "fulfilled" && Array.isArray(bg.value)) setByGeom(bg.value);
      if (tr.status === "fulfilled" && Array.isArray(tr.value)) setTrends(tr.value);
      if (st.status === "fulfilled" && Array.isArray(st.value)) setStorage(st.value);
      if (pr.status === "fulfilled" && Array.isArray(pr.value)) setProgress(pr.value);
      if (tl.status === "fulfilled" && Array.isArray(tl.value)) setTopLayers(tl.value);
      if (tp.status === "fulfilled" && Array.isArray(tp.value)) setTopProjects(tp.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const totalStorage = storage.reduce((s, i) => s + (i.size_mb || 0), 0);
  const maxProgress = Math.max(...progress.map((p) => p.assets || 0), 1);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent">
            Spatial Analytics & Statistics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-medium">
            Live database telemetry, asset distribution, storage usage, and project trends
          </p>
        </div>

        <Button
          variant="outline"
          onClick={loadAll}
          disabled={loading}
          className="gap-2 cursor-pointer border-border/70 hover:bg-muted"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-primary" : ""} />
          <span>Refresh Analytics</span>
        </Button>
      </div>

      {/* ── Row 1: Assets by Layer + Department ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assets by Layer */}
        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm hover:border-primary/40 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <BarChart2 size={16} className="text-sky-500" />
              <span>Assets by GIS Layer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : byLayer.length === 0 ? (
              <EmptyChart message="No layer assets found" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byLayer} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => (v.length > 14 ? v.slice(0, 14) + "…" : v)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Asset Count" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {byLayer.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Assets by Department */}
        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm hover:border-primary/40 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <PieIcon size={16} className="text-violet-500" />
              <span>Assets by Department</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : byDept.length === 0 ? (
              <EmptyChart message="No department data found" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={byDept}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {byDept.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span className="text-xs font-medium text-muted-foreground">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Upload Trends + Assets by Geometry ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Upload Trends */}
        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm hover:border-primary/40 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <TrendingUp size={16} className="text-emerald-500" />
              <span>Upload & Ingestion Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : trends.length === 0 ? (
              <EmptyChart message="No upload trend data" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trends} margin={{ left: 0, right: 10, top: 10 }}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => {
                      try {
                        return new Date(v).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        });
                      } catch {
                        return v;
                      }
                    }}
                  />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Datasets Ingested"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fill="url(#trendGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Assets by Geometry */}
        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm hover:border-primary/40 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <Shapes size={16} className="text-amber-500" />
              <span>Assets by Geometry Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : byGeom.length === 0 ? (
              <EmptyChart message="No geometry breakdown found" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byGeom} margin={{ left: 0, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Features" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {byGeom.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Project Progress + Storage Usage ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Project Progress */}
        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm hover:border-primary/40 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <FolderKanban size={16} className="text-primary" />
              <span>Project Asset Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 py-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            ) : progress.length === 0 ? (
              <EmptyChart message="No project data found" />
            ) : (
              <div className="space-y-4 py-2">
                {progress.slice(0, 6).map((p, i) => (
                  <ProgressBar
                    key={`${p.name}-${i}`}
                    label={p.name}
                    value={p.assets || 0}
                    max={maxProgress}
                    color={COLORS[i % COLORS.length]}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm hover:border-primary/40 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <HardDrive size={16} className="text-cyan-500" />
              <span>GIS Dataset Storage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3 py-2">
                <div className="h-20 animate-pulse rounded-xl bg-muted" />
                <div className="h-10 animate-pulse rounded-xl bg-muted" />
              </div>
            ) : storage.length === 0 ? (
              <EmptyChart message="No storage data available" />
            ) : (
              <div className="space-y-4">
                {/* Total Storage Banner */}
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                      Total Ingested Data
                    </p>
                    <p className="text-2xl font-extrabold font-mono text-foreground">
                      {totalStorage.toFixed(2)} MB
                    </p>
                  </div>
                  <HardDrive className="h-8 w-8 text-cyan-500/40" />
                </div>

                {/* Per Dataset Progress Bars */}
                <div className="space-y-3">
                  {storage.slice(0, 5).map((s, i) => (
                    <ProgressBar
                      key={`${s.name}-${i}`}
                      label={s.name}
                      value={parseFloat((s.size_mb || 0.05).toFixed(2))}
                      max={Math.max(...storage.map((x) => x.size_mb || 0.05))}
                      color={COLORS[i % COLORS.length]}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 4: Leaderboards (Top Layers & Top Projects) ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {[
          {
            title: "Top GIS Layers by Features",
            data: topLayers,
            icon: <BarChart2 size={16} className="text-sky-500" />,
            unit: "assets",
          },
          {
            title: "Top Projects by Total Volume",
            data: topProjects,
            icon: <TrendingUp size={16} className="text-emerald-500" />,
            unit: "features",
          },
        ].map(({ title, data, icon, unit }) => (
          <Card
            key={title}
            className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm hover:border-primary/40 transition-all"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                {icon}
                <span>{title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3 py-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : data.length === 0 ? (
                <EmptyChart message="No ranking data available" />
              ) : (
                <div className="space-y-2.5 py-1">
                  {data.slice(0, 6).map((item, i) => (
                    <div
                      key={`${item.name}-${i}`}
                      className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-2 hover:bg-muted/40 transition-colors"
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold font-mono shadow-xs"
                        style={{
                          background: COLORS[i % COLORS.length] + "25",
                          color: COLORS[i % COLORS.length],
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate text-xs font-semibold text-foreground">
                        {item.name}
                      </span>
                      <span className="shrink-0 text-xs font-bold font-mono text-foreground">
                        {item.value.toLocaleString("en-IN")}{" "}
                        <span className="text-[10px] font-normal text-muted-foreground">{unit}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
