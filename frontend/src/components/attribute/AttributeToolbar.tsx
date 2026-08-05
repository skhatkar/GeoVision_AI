"use client";

import {
  Download,
  RefreshCcw,
  Filter,
  BarChart3,
} from "lucide-react";

import AttributeSearch from "./AttributeSearch";

interface Props {
  search: string;
  setSearch: (value: string) => void;
}

export default function AttributeToolbar({
  search,
  setSearch,
}: Props) {
  return (
    <div className="flex items-center gap-3 border-b p-3">

      <div className="flex-1">
        <AttributeSearch
          value={search}
          onChange={setSearch}
        />
      </div>

      <button className="rounded-lg border p-2 hover:bg-muted">
        <RefreshCcw size={18} />
      </button>

      <button className="rounded-lg border p-2 hover:bg-muted">
        <Filter size={18} />
      </button>

      <button className="rounded-lg border p-2 hover:bg-muted">
        <BarChart3 size={18} />
      </button>

      <button className="rounded-lg border p-2 hover:bg-muted">
        <Download size={18} />
      </button>

    </div>
  );
}