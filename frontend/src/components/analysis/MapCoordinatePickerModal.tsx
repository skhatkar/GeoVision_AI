"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MapCoordinatePickerModalClient = dynamic(
  () => import("./MapCoordinatePickerModalClient"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 text-xs text-slate-200 bg-slate-900 px-4 py-3 rounded-xl border border-slate-700">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span>Loading Spatial Map Picker…</span>
        </div>
      </div>
    ),
  }
);

interface Props {
  initialLat?: number;
  initialLng?: number;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function MapCoordinatePickerModal(props: Props) {
  return <MapCoordinatePickerModalClient {...props} />;
}
