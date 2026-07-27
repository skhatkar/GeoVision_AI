"use client";

import dynamic from "next/dynamic";

const MapPreview = dynamic(
  () => import("./MapPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        Loading map...
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