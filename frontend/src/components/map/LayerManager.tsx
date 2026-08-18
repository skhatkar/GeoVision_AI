"use client";

import { useState } from "react";

import LayerList from "@/components/layers/LayerList";
import LayerToolbar from "@/components/layers/LayerToolbar";

export default function LayerManager() {
  const [search, setSearch] =
    useState("");

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        flex-col
        bg-background
      "
    >

      {/* Toolbar */}

      <LayerToolbar
        search={search}
        setSearch={setSearch}
      />

      {/* Layers */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          p-3
        "
      >
        <LayerList
          search={search}
        />
      </div>

    </div>
  );
}