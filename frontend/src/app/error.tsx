"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GeoVision AI Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 border border-destructive/20">
            <AlertTriangle size={36} className="text-destructive" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred in the GeoVision AI platform. Our spatial engine has logged this event.
          </p>
          {error.message && (
            <p className="text-xs font-mono bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-muted-foreground mt-3 text-left break-all">
              {error.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={reset}
            className="gap-2 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw size={13} />
            Try Again
          </Button>
          <Button variant="outline" asChild className="gap-2 text-xs font-semibold cursor-pointer">
            <Link href="/dashboard">
              <Home size={13} />
              Dashboard
            </Link>
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          GeoVision AI · Government of Himachal Pradesh
        </p>
      </div>
    </div>
  );
}
