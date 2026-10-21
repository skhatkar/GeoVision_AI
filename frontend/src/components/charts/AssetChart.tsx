"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Folder,
  FolderOpen,
  Layers,
  PieChart as PieIcon,
  BarChart2,
  Filter,
  Sparkles,
  Download,
  MapPin,
  ExternalLink,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAssetDistribution } from "@/services/dashboard";
import { getProjects, type Project } from "@/api/projectApi";
import type { AssetDistributionItem } from "@/types/dashboard";

// ============================================================
// CHART COLORS
// ============================================================

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Violet
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#EF4444", // Red
  "#84CC16", // Lime
  "#6366F1", // Indigo
  "#14B8A6", // Teal
];

// Custom Tooltip
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  const fill = data.payload?.fill || data.color || "#3B82F6";
  const name = data.payload?.name || data.name;
  const val = data.payload?.value ?? data.value;
  const percent = data.payload?.percent;

  return (
    <div className="rounded-xl border bg-popover/95 backdrop-blur-xs p-3 shadow-lg text-xs space-y-1 z-50">
      <p className="font-semibold text-foreground flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full inline-block shrink-0"
          style={{ backgroundColor: fill }}
        />
        {name}
      </p>
      <div className="flex items-center justify-between gap-4 text-muted-foreground">
        <span>Total Assets:</span>
        <span className="font-bold text-foreground font-mono">
          {Number(val).toLocaleString("en-IN")}
        </span>
      </div>
      {percent !== undefined && (
        <div className="flex items-center justify-between gap-4 text-muted-foreground text-[11px]">
          <span>Share:</span>
          <span className="font-semibold text-primary font-mono">
            {(percent * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default function AssetChart() {
  const router = useRouter();
  const [chartType, setChartType] = useState<"donut" | "bar">("donut");
  // When selectedProjectId is "all", we show Project-Wise distribution across all projects.
  // When a specific project ID is selected, we show ONLY the layers of that project.
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [distributionData, setDistributionData] = useState<AssetDistributionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch projects list for filter dropdown and pills
  useEffect(() => {
    getProjects()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.items || [];
        setProjects(list);
      })
      .catch(() => setProjects([]));
  }, []);

  const isProjectSelected = selectedProjectId !== "all";
  const currentProjectObj = useMemo(() => {
    if (!Array.isArray(projects)) return undefined;
    return projects.find((p) => String(p.id) === selectedProjectId);
  }, [projects, selectedProjectId]);

  // Fetch asset distribution based on selected project
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    if (selectedProjectId === "all") {
      // 1. Show all projects breakdown
      getAssetDistribution({ by: "project" })
        .then((res) => {
          if (isMounted) setDistributionData(res || []);
        })
        .catch((err) => {
          console.error("Project distribution fetch failed:", err);
          if (isMounted) setError(true);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      // 2. Show ONLY the layers of this specific selected project
      const pIdNum = Number(selectedProjectId);
      getAssetDistribution({
        by: "layer",
        project_id: Number.isFinite(pIdNum) ? pIdNum : undefined,
      })
        .then((res) => {
          if (isMounted) setDistributionData(res || []);
        })
        .catch((err) => {
          console.error("Project layer distribution fetch failed:", err);
          if (isMounted) setError(true);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedProjectId]);

  const totalAssets = useMemo(() => {
    return distributionData.reduce((sum, item) => sum + item.value, 0);
  }, [distributionData]);

  // Enrich data with percentage and styling colors
  const chartData = useMemo(() => {
    return distributionData.map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length],
      percent: totalAssets > 0 ? item.value / totalAssets : 0,
    }));
  }, [distributionData, totalAssets]);

  // Dynamic Insight Generator
  const topContributor = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((max, cur) => (cur.value > max.value ? cur : max), chartData[0]);
  }, [chartData]);

  const handleExportCSV = () => {
    if (chartData.length === 0) return;

    const titlePrefix = isProjectSelected
      ? currentProjectObj?.name || `Project_${selectedProjectId}`
      : "All_Projects";

    const rows = ["Type,Name,Asset Count,Percentage Share"];
    chartData.forEach((item) => {
      rows.push(
        `"${isProjectSelected ? "LAYER" : "PROJECT"}","${item.name}","${item.value}","${(item.percent * 100).toFixed(2)}%"`
      );
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `asset_distribution_${titlePrefix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clicking on an item: If in overview, drill-down into that project!
  const handleItemClick = (item: any) => {
    if (!isProjectSelected && item.id) {
      setSelectedProjectId(String(item.id));
    } else if (isProjectSelected && item.id) {
      router.push(`/map?layer=${item.id}`);
    }
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-xs overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title & Info */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PieIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-base font-semibold">
                  Asset Distribution
                </CardTitle>
                {isProjectSelected && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium bg-amber-500/10 text-amber-600 border-amber-500/20">
                    Project Filtered
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isProjectSelected
                  ? `Showing ONLY layers & assets in "${currentProjectObj?.name || "Selected Project"}"`
                  : "State-wide asset distribution across all projects"}
              </p>
            </div>
          </div>

          {/* Controls: Chart Type Toggle, Project Dropdown & Export */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Chart Type (Donut vs Bar) */}
            <div className="flex rounded-lg border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setChartType("donut")}
                className={`
                  flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer
                  ${
                    chartType === "donut"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
                title="Donut Chart View"
              >
                <PieIcon size={14} />
              </button>
              <button
                type="button"
                onClick={() => setChartType("bar")}
                className={`
                  flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer
                  ${
                    chartType === "bar"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
                title="Ranked Bar Chart View"
              >
                <BarChart2 size={14} />
              </button>
            </div>

            {/* Project Filter Dropdown */}
            {projects.length > 0 && (
              <Select
                value={selectedProjectId}
                onValueChange={(v) => setSelectedProjectId(v ?? "all")}
              >
                <SelectTrigger className="h-7 text-xs w-40 font-medium">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="all">📁 All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Reset to All Projects Button */}
            {isProjectSelected && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs gap-1 cursor-pointer"
                onClick={() => setSelectedProjectId("all")}
                title="Show all projects"
              >
                <X size={12} />
                <span>All Projects</span>
              </Button>
            )}

            {/* Export CSV Button */}
            {chartData.length > 0 && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={handleExportCSV}
                title="Export CSV of distribution data"
              >
                <Download size={13} />
              </Button>
            )}
          </div>
        </div>

        {/* Project Selector Pills Bar */}
        {projects.length > 1 && (
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setSelectedProjectId("all")}
              className={`
                flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition-all shrink-0 cursor-pointer
                ${
                  !isProjectSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <Folder size={11} />
              All Projects
            </button>

            {projects.map((p) => {
              const isSelected = selectedProjectId === String(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProjectId(String(p.id))}
                  className={`
                    flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] transition-all shrink-0 cursor-pointer
                    ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <Folder size={11} className={isSelected ? "text-primary-foreground" : "text-amber-500"} />
                  <span className="truncate max-w-[150px]">{p.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* AI / GIS Summary Insight Pill */}
        {topContributor && totalAssets > 0 && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-primary/5 border border-primary/15 px-2.5 py-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 truncate">
              <Sparkles size={13} className="text-primary shrink-0" />
              <span>
                {isProjectSelected ? (
                  <>
                    In <strong className="text-foreground">{currentProjectObj?.name}</strong>,{" "}
                    <strong className="text-foreground">{topContributor.name}</strong> holds{" "}
                    <strong className="text-primary font-mono">
                      {(topContributor.percent * 100).toFixed(1)}%
                    </strong>{" "}
                    ({topContributor.value.toLocaleString("en-IN")} assets)
                  </>
                ) : (
                  <>
                    <strong className="text-foreground">{topContributor.name}</strong> leads with{" "}
                    <strong className="text-primary font-mono">
                      {(topContributor.percent * 100).toFixed(1)}%
                    </strong>{" "}
                    ({topContributor.value.toLocaleString("en-IN")} assets)
                  </>
                )}
              </span>
            </span>
            <span className="text-[11px] font-mono text-muted-foreground shrink-0">
              {chartData.length} {isProjectSelected ? "layers" : "projects"}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 flex-1">
        {/* Loading state */}
        {loading && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-xs">
              {isProjectSelected
                ? `Loading assets for "${currentProjectObj?.name || "Project"}"…`
                : "Loading asset distribution…"}
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <p className="text-xs text-destructive">Failed to load asset distribution</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && chartData.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
            <PieIcon size={32} className="mb-2 opacity-40" />
            <p className="text-sm font-medium">No assets found in this project</p>
            <p className="text-xs mt-0.5">Upload a dataset or assign layers to this project to view breakdown.</p>
          </div>
        )}

        {/* Chart View Content */}
        {!loading && !error && chartData.length > 0 && (
          <>
            {chartType === "donut" ? (
              /* Donut View */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-6 relative h-[250px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={3}
                        animationDuration={700}
                        onClick={(data) => handleItemClick(data)}
                        className="cursor-pointer"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Total Count */}
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                      {totalAssets.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-muted-foreground uppercase font-medium tracking-wider">
                      {isProjectSelected ? "Project Assets" : "Total Assets"}
                    </span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="md:col-span-6 max-h-[250px] overflow-y-auto space-y-1.5 pr-1">
                  {chartData.map((item, idx) => (
                    <div
                      key={`${item.id ?? item.name}-${idx}`}
                      onClick={() => handleItemClick(item)}
                      className="group flex items-center justify-between gap-2 rounded-lg border bg-muted/20 p-2 text-xs hover:bg-muted/50 transition-colors cursor-pointer"
                      title={!isProjectSelected ? "Click to view project layers" : "Click to view on map"}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="font-medium text-foreground truncate">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-muted-foreground text-xs">
                          {item.value.toLocaleString("en-IN")}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono px-1.5 py-0 bg-muted text-foreground"
                        >
                          {(item.percent * 100).toFixed(1)}%
                        </Badge>
                        {!isProjectSelected ? (
                          <ChevronRight
                            size={12}
                            className="text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <ExternalLink
                            size={11}
                            className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Ranked Horizontal Bar View */
              <div className="h-[260px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload[0]) {
                        handleItemClick(e.activePayload[0].payload);
                      }
                    }}
                  >
                    <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={125}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => (v.length > 16 ? v.slice(0, 16) + "…" : v)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22} className="cursor-pointer">
                      {chartData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}