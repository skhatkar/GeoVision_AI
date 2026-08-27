import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
  color: string;
  gradient?: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon,
  color,
  gradient = "from-primary/10 via-transparent to-transparent",
}: StatCardProps) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-border/60
        bg-card/90
        backdrop-blur-xs
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1.5
        hover:shadow-xl
        hover:border-primary/40
      "
    >
      {/* Subtle Background Glow Gradient on Hover */}
      <div
        className={`absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${gradient} blur-2xl transition-opacity duration-500 opacity-40 group-hover:opacity-80 pointer-events-none`}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div
          className={`flex h-13 w-13 items-center justify-center rounded-2xl ${color} transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md`}
        >
          {icon}
        </div>

        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-45">
          <ArrowUpRight size={15} />
        </div>
      </div>

      <div className="relative z-10 mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>

        <h2 className="mt-1.5 text-3xl font-extrabold font-mono tracking-tight text-foreground transition-colors group-hover:text-primary">
          {value}
        </h2>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}