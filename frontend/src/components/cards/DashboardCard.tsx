"use client";

import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: React.ReactNode;
}

export default function DashboardCard({
  title,
  value,
  change,
  positive = true,
  icon,
}: DashboardCardProps) {
  return (
    <Card className="rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between">

        <div className="space-y-2">

          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <h2 className="text-3xl font-bold">
            {value}
          </h2>

          <div
            className={`flex items-center gap-1 text-sm ${
              positive
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {positive ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}

            {change}
          </div>

        </div>

        <div className="rounded-2xl bg-primary/10 p-4 text-primary">
          {icon}
        </div>

      </div>
    </Card>
  );
}