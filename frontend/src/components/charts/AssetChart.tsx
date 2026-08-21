"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import useDashboard from "@/hooks/useDashboard";


// ============================================================
// CHART COLORS
// ============================================================

const COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#8b5cf6",
  "#f97316",
  "#ef4444",
  "#eab308",
  "#14b8a6",
  "#ec4899",
  "#6366f1",
  "#84cc16",
];


// ============================================================
// COMPONENT
// ============================================================

export default function AssetChart() {

  const {
    data,
    loading,
    error,
  } = useDashboard();


  const chartData =
    data?.assetDistribution ?? [];


  return (

    <Card className="h-[420px] rounded-2xl">

      <CardHeader>

        <CardTitle>
          Asset Distribution
        </CardTitle>

      </CardHeader>


      <CardContent className="h-[340px]">

        {/* LOADING */}

        {loading && (

          <div className="flex h-full items-center justify-center">

            <p className="text-sm text-muted-foreground">
              Loading asset distribution...
            </p>

          </div>

        )}


        {/* ERROR */}

        {!loading && error && (

          <div className="flex h-full items-center justify-center">

            <p className="text-sm text-red-500">
              Failed to load asset distribution
            </p>

          </div>

        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          chartData.length === 0 && (

            <div className="flex h-full items-center justify-center">

              <p className="text-sm text-muted-foreground">
                No asset data available
              </p>

            </div>

          )}


        {/* CHART */}

        {!loading &&
          !error &&
          chartData.length > 0 && (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={60}
                  paddingAngle={3}
                >

                  {chartData.map(
                    (_, index) => (

                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[
                            index %
                            COLORS.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>


                <Tooltip
                  formatter={(value) => [
                    value,
                    "Assets",
                  ]}
                />


                <Legend />

              </PieChart>

            </ResponsiveContainer>

          )}

      </CardContent>

    </Card>
  );
}