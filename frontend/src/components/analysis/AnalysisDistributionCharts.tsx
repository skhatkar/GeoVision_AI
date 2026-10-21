"use client";

import { useMemo, useState } from "react";
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
  Legend,
} from "recharts";
import { PieChart as PieIcon, BarChart2, Layers, MapPin, Sparkles } from "lucide-react";

const CHART_COLORS = [
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#8B5CF6", // Violet
  "#F59E0B", // Amber
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
];

interface Props {
  result: any;
  toolId?: string;
}

export default function AnalysisDistributionCharts({ result, toolId }: Props) {
  const [chartType, setChartType] = useState<"donut" | "bar">("donut");

  // Extract raw rows/items from result
  const items: any[] = useMemo(() => {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    return (
      result.features ||
      result.results ||
      result.assets ||
      result.centroids ||
      result.data ||
      []
    );
  }, [result]);

  // Compute category/attribute distribution data
  const categoryData = useMemo(() => {
    if (items.length === 0) return [];

    const counts: Record<string, number> = {};

    items.forEach((item) => {
      const props = item.properties || item.attributes || item;
      const category =
        props.category ||
        props.type ||
        props.geometry_type ||
        props.layer_name ||
        props.asset_type ||
        props.status ||
        "General Feature";

      const key = String(category).trim();
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [items]);

  // Compute distance band distribution (for nearest neighbor or distance outputs)
  const distanceData = useMemo(() => {
    if (items.length === 0) return [];
    const hasDistance = items.some((it) => it.distance !== undefined || (it.properties && it.properties.distance !== undefined));
    if (!hasDistance) return [];

    const bands: Record<string, number> = {
      "< 250m": 0,
      "250m - 500m": 0,
      "500m - 1km": 0,
      "1km - 5km": 0,
      "> 5km": 0,
    };

    items.forEach((it) => {
      const dist = Number(it.distance ?? it.properties?.distance ?? 0);
      if (dist < 250) bands["< 250m"]++;
      else if (dist < 500) bands["250m - 500m"]++;
      else if (dist < 1000) bands["500m - 1km"]++;
      else if (dist < 5000) bands["1km - 5km"]++;
      else bands["> 5km"]++;
    });

    return Object.entries(bands)
      .filter(([, count]) => count > 0)
      .map(([name, count]) => ({ name, count }));
  }, [items]);

  // Compute regional / district distribution if available in feature attributes
  const districtData = useMemo(() => {
    if (items.length === 0) return [];

    const counts: Record<string, number> = {};
    let hasDistrict = false;

    items.forEach((item) => {
      const props = item.properties || item.attributes || item;
      const district = props.district || props.tehsil || props.county || props.region || props.container_name;

      if (district) {
        hasDistrict = true;
        const key = String(district).trim();
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    if (!hasDistrict) return [];

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <PieIcon size={15} className="text-cyan-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Feature & Attribute Breakdowns ({items.length} Matched Items)
          </h4>
        </div>

        {/* Donut vs Bar Switcher */}
        <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setChartType("donut")}
            className={`px-2.5 py-0.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
              chartType === "donut" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground"
            }`}
          >
            <PieIcon size={12} /> Donut
          </button>
          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={`px-2.5 py-0.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
              chartType === "bar" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground"
            }`}
          >
            <BarChart2 size={12} /> Bar Chart
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Chart Card 1: Feature Category / Type Breakdown */}
        {categoryData.length > 0 && (
          <div className="rounded-xl border border-border/70 bg-card/80 p-3 shadow-xs space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Categorical Distribution
            </p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "donut" ? (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#f8fafc",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  </PieChart>
                ) : (
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#f8fafc",
                      }}
                    />
                    <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart Card 2: Distance Bands or Regional Breakdown */}
        {(distanceData.length > 0 || districtData.length > 0) && (
          <div className="rounded-xl border border-border/70 bg-card/80 p-3 shadow-xs space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {distanceData.length > 0 ? "Proximity Distance Bands" : "Regional Administrative Breakdown"}
            </p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={distanceData.length > 0 ? distanceData : districtData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill={distanceData.length > 0 ? "#10b981" : "#8b5cf6"}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
