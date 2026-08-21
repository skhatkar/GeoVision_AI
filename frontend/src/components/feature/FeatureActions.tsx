"use client";

import {
  Crosshair,
  Download,
  Copy,
  Zap,
} from "lucide-react";
import type { Path } from "leaflet";

import { useSelectionStore } from "@/store/selectionStore";
import { useMapStore } from "@/store/mapStore";

export default function FeatureActions() {
  const map = useMapStore((s) => s.map);

  const {
    bounds,
    centroid,
    selectedFeature,
  } = useSelectionStore();

  const zoomToFeature = () => {
    if (!map || !bounds) return;

    map.fitBounds(bounds, {
      padding: [40, 40],
    });
  };

  const flashFeature = () => {
    const layer =
      useSelectionStore.getState()
        .selectedLeafletLayer;

    if (!layer) return;

    const styledLayer = layer as Path;

    let visible = false;

    const interval = setInterval(() => {
      styledLayer.setStyle({
        color: visible
          ? "#FFD700"
          : "#FF0000",
      });

      visible = !visible;
    }, 200);

    setTimeout(() => {
      clearInterval(interval);

      styledLayer.setStyle({
        color: "#FFD700",
      });
    }, 1500);
  };

  const copyCoordinates = async () => {
    if (!centroid) return;

    const coordinates = `${centroid[0]}, ${centroid[1]}`;

    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(coordinates);
          alert("Coordinates copied");
          return;
        } catch {
          // Local HTTP deployments can expose the API but reject writes.
        }
      }

      const input = document.createElement("textarea");
      input.value = coordinates;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(input);

      if (!copied) throw new Error("Browser did not permit clipboard access");

      alert("Coordinates copied");
    } catch (error) {
      console.error(
        "Failed to copy coordinates:",
        error
      );

      alert("Unable to copy coordinates");
    }
  };

  const downloadFeature = () => {
    if (!selectedFeature) return;

    const blob = new Blob(
      [
        JSON.stringify(
          selectedFeature,
          null,
          2
        ),
      ],
      {
        type: "application/geo+json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download = "feature.geojson";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="mb-4 font-semibold">
        Actions
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={zoomToFeature}
          className="rounded-lg border p-2 hover:bg-muted"
        >
          <Crosshair
            className="mx-auto mb-1"
            size={18}
          />
          Zoom
        </button>

        <button
          onClick={flashFeature}
          className="rounded-lg border p-2 hover:bg-muted"
        >
          <Zap
            className="mx-auto mb-1"
            size={18}
          />
          Flash
        </button>

        <button
          onClick={copyCoordinates}
          className="rounded-lg border p-2 hover:bg-muted"
        >
          <Copy
            className="mx-auto mb-1"
            size={18}
          />
          Copy
        </button>

        <button
          onClick={downloadFeature}
          className="rounded-lg border p-2 hover:bg-muted"
        >
          <Download
            className="mx-auto mb-1"
            size={18}
          />
          Export
        </button>
      </div>
    </div>
  );
}
