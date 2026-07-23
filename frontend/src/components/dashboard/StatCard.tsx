import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
  color: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon,
  color,
}: StatCardProps) {
  return (
    <div
      className="
      group
      rounded-3xl
      border
      border-white/10
      bg-card
      p-6
      shadow-lg
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-2xl
      "
    >
      <div className="flex items-center justify-between">

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}
        >
          {icon}
        </div>

        <ArrowUpRight
          size={18}
          className="text-emerald-400 opacity-70"
        />
      </div>

      <div className="mt-8">

        <p className="text-sm text-muted-foreground">
          {title}
        </p>

        <h2 className="mt-2 text-4xl font-bold">
          {value}
        </h2>

        <p className="mt-2 text-sm text-emerald-400">
          {change}
        </p>

      </div>

    </div>
  );
}