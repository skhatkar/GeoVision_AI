"use client";

import {
  RefreshCcw,
  Search,
} from "lucide-react";

interface Props {
  search: string;
  setSearch: (
    value: string
  ) => void;

  onRefresh?: () => void;
}

export default function LayerToolbar({
  search,
  setSearch,
  onRefresh,
}: Props) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        border-b
        p-3
      "
    >
      {/* Search */}

      <div
        className="
          relative
          min-w-0
          flex-1
        "
      >
        <Search
          size={16}
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-muted-foreground
          "
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search layers..."
          className="
            h-9
            w-full
            rounded-lg
            border
            bg-background
            pl-9
            pr-3
            text-sm
            outline-none
            transition
            focus:border-sky-500
            focus:ring-2
            focus:ring-sky-500/20
          "
        />
      </div>

      {/* Refresh */}

      <button
        type="button"
        onClick={onRefresh}
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          hover:bg-muted
        "
        title="Refresh layers"
      >
        <RefreshCcw size={16} />
      </button>

    </div>
  );
}