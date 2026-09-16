import AppShell from "@/components/layout/AppShell";
import { Brain } from "lucide-react";

export default function AILoading() {
  return (
    <AppShell>
      {/* Header Skeleton */}
      <div className="space-y-2 animate-pulse">
        <div className="h-8 w-56 rounded-xl bg-muted/60" />
        <div className="h-4 w-80 rounded-lg bg-muted/40" />
      </div>

      {/* Main AI Chat & Spatial Reasoning Shell */}
      <div className="mt-8 flex h-[calc(100vh-210px)] flex-col rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xs animate-pulse">
        {/* Top Copilot Bar */}
        <div className="flex h-14 items-center justify-between border-b border-border/50 bg-muted/30 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Brain size={18} />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-32 rounded bg-muted/60" />
              <div className="h-2.5 w-44 rounded bg-muted/40" />
            </div>
          </div>
          <div className="h-7 w-24 rounded-lg bg-muted/40" />
        </div>

        {/* Conversation Area Skeleton */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Bot Greeting Bubble */}
          <div className="flex items-start gap-3 max-w-xl">
            <div className="h-9 w-9 rounded-xl bg-muted/60 shrink-0" />
            <div className="rounded-2xl rounded-tl-none bg-muted/30 p-4 space-y-2 w-full">
              <div className="h-4 w-4/5 rounded bg-muted/60" />
              <div className="h-4 w-3/5 rounded bg-muted/50" />
            </div>
          </div>

          {/* User Bubble */}
          <div className="flex items-start gap-3 max-w-lg ml-auto justify-end">
            <div className="rounded-2xl rounded-tr-none bg-primary/20 p-4 space-y-2 w-full">
              <div className="h-4 w-full rounded bg-primary/30" />
            </div>
            <div className="h-9 w-9 rounded-xl bg-muted/60 shrink-0" />
          </div>

          {/* Bot Thinking Bubble */}
          <div className="flex items-start gap-3 max-w-xl">
            <div className="h-9 w-9 rounded-xl bg-muted/60 shrink-0" />
            <div className="rounded-2xl rounded-tl-none bg-muted/30 p-4 space-y-2 w-full">
              <div className="h-4 w-3/4 rounded bg-muted/60" />
              <div className="h-20 rounded-xl bg-muted/20" />
            </div>
          </div>
        </div>

        {/* Bottom Input Area Skeleton */}
        <div className="border-t border-border/50 bg-muted/20 p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 flex-1 rounded-xl bg-muted/50" />
            <div className="h-12 w-28 rounded-xl bg-muted/60 shrink-0" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
