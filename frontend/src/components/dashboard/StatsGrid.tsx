import {
  Database,
  Layers,
  Box,
  Brain,
} from "lucide-react";

import StatCard from "./StatCard";

export default function StatsGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

      <StatCard
          title="Assets"
          value="14,326"
          change="+247 this month"
          icon={<Box />}
          color="bg-sky-500/20 text-sky-400"
      />

      <StatCard
          title="Datasets"
          value="238"
          change="18 uploaded today"
          icon={<Database />}
          color="bg-emerald-500/20 text-emerald-400"
      />

      <StatCard
          title="Layers"
          value="128"
          change="12 active services"
          icon={<Layers />}
          color="bg-violet-500/20 text-violet-400"
      />

      <StatCard
          title="AI Accuracy"
          value="96.8%"
          change="+0.8% this week"
          icon={<Brain />}
          color="bg-orange-500/20 text-orange-400"
      />

    </div>
  );
}