"use client";

import { BASEMAPS } from "@/constants/basemaps";
import { useMapStore } from "@/store/mapStore";

export default function BasemapSwitcher() {

  const basemap = useMapStore((state) => state.basemap);
  const setBasemap = useMapStore((state) => state.setBasemap);

  return (

    <select
      value={basemap}
      onChange={(e) => setBasemap(e.target.value)}
      className="rounded-lg border bg-zinc-900 px-3 py-2 text-white"
    >

      {Object.entries(BASEMAPS).map(([key, value]) => (

        <option
          key={key}
          value={key}
        >
          {value.name}
        </option>

      ))}

    </select>

  );

}