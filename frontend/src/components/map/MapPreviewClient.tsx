"use client";

import dynamic from "next/dynamic";

const MapPreview = dynamic(
  () => import("./MapPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] rounded-xl border flex items-center justify-center">
        Loading map...
      </div>
    ),
  }
);

export default function MapPreviewClient() {
  return <MapPreview />;
}