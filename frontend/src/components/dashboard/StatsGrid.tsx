"use client";

import {
  Database,
  Layers,
  Box,
  FolderKanban,
} from "lucide-react";

import StatCard from "./StatCard";

import useDashboard from "@/hooks/useDashboard";


function formatNumber(value: number) {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
}


export default function StatsGrid() {
  const {
    data,
    loading,
    error,
  } = useDashboard();


  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-44 animate-pulse rounded-3xl border border-white/10 bg-card"
          />
        ))}
      </div>
    );
  }


  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400">
        Unable to load dashboard statistics.
      </div>
    );
  }


  const {
    total_assets,
    total_datasets,
    total_layers,
    total_projects,
  } = data.summary;


  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Assets"
        value={formatNumber(total_assets)}
        change="Live database count"
        icon={<Box />}
        color="bg-sky-500/20 text-sky-400"
      />

      <StatCard
        title="Datasets"
        value={formatNumber(total_datasets)}
        change="Live database count"
        icon={<Database />}
        color="bg-emerald-500/20 text-emerald-400"
      />

      <StatCard
        title="Layers"
        value={formatNumber(total_layers)}
        change="Live database count"
        icon={<Layers />}
        color="bg-violet-500/20 text-violet-400"
      />

      <StatCard
        title="Projects"
        value={formatNumber(total_projects)}
        change="Live database count"
        icon={<FolderKanban />}
        color="bg-orange-500/20 text-orange-400"
      />

    </div>
  );
}