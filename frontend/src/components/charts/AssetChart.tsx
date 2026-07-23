"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { Card } from "@/components/ui/card";

const data = [
  { name: "Roads", value: 420 },
  { name: "Schools", value: 310 },
  { name: "Hospitals", value: 180 },
  { name: "Water Supply", value: 260 },
  { name: "Electricity", value: 140 },
];

const COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#8b5cf6",
  "#f97316",
  "#ef4444",
];

export default function AssetChart() {
  return (
    <Card className="rounded-2xl p-6 h-[420px]">

      <h2 className="mb-6 text-xl font-semibold">
        Asset Distribution
      </h2>

      <ResponsiveContainer width="100%" height="90%">
        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            outerRadius={120}
            innerRadius={65}
            paddingAngle={4}
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>
      </ResponsiveContainer>

    </Card>
  );
}