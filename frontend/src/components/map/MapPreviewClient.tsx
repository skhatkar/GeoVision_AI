"use client";

import dynamic from "next/dynamic";

const MapPreview = dynamic(
  () => import("./MapPreview"),
  {
    ssr: false,

    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-500">
          Loading map...
        </div>
      </div>
    ),
  }
);

export default function MapPreviewClient() {
  return (
    <div className="h-full w-full">
      <MapPreview />
    </div>
  );
}