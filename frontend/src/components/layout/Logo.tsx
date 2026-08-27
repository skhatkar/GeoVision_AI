import Link from "next/link";
import { Globe2 } from "lucide-react";

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer select-none">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 via-primary to-emerald-500 shadow-md shadow-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30">
        <Globe2 className="h-6 w-6 text-white transition-transform duration-500 group-hover:rotate-12" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-card" />
        </span>
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            GeoVision AI
          </h1>
          <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold font-mono text-primary uppercase tracking-wider">
            HP
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground font-medium group-hover:text-primary transition-colors">
          State GIS Platform
        </p>
      </div>
    </Link>
  );
}