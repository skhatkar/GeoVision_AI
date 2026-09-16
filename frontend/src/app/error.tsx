"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, LayoutDashboard, Globe2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("GeoVision App Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* State SDI Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-lg shadow-destructive/10 ring-1 ring-destructive/20">
          <ShieldAlert size={32} />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
            <span>Spatial Engine Interruption</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The spatial runtime encountered an unhandled exception while loading this geospatial module.
          </p>
        </div>

        {/* Error Details Card */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 text-left shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={15} className="text-destructive mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-mono font-medium text-destructive truncate">
                {error.name || "Error"}: {error.message || "Unknown error"}
              </p>
              {error.digest && (
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto h-10 gap-2 text-xs font-semibold shadow-sm cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Try Again</span>
          </Button>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full h-10 gap-2 text-xs font-semibold cursor-pointer"
            >
              <LayoutDashboard size={14} />
              <span>Go to Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Footer info */}
        <div className="border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
          GeoVision AI · HP State Spatial Data Infrastructure
        </div>
      </div>
    </div>
  );
}
