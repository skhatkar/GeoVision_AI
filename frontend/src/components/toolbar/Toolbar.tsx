"use client";

import NavigationTools from "./NavigationTools";
import SelectionTools from "./SelectionTools";
import AnalysisTools from "./AnalysisTools";
import ExportTools from "./ExportTools";

export default function Toolbar() {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-background p-2 shadow-md">

      <NavigationTools />

      <div className="h-8 w-px bg-border" />

      <SelectionTools />

      <div className="h-8 w-px bg-border" />

      <AnalysisTools />

      <div className="h-8 w-px bg-border" />

      <ExportTools />

    </div>
  );
}