"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const AnalysisMapResultClient = dynamic(
  () => import("./AnalysisMapResultClient"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[340px] w-full items-center justify-center rounded-xl border border-border/70 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span>Initializing Spatial Preview Canvas…</span>
        </div>
      </div>
    ),
  }
);

interface Props {
  result: any;
  toolId?: string;
}

export default function AnalysisMapResult(props: Props) {
  return <AnalysisMapResultClient {...props} />;
}
