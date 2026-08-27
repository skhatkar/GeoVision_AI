"use client";

import { useSelectionStore } from "@/store/selectionStore";
import FeatureHeader from "./FeatureHeader";
import FeatureAttributes from "./FeatureAttributes";
import CoordinateCard from "./CoordinateCard";
import FeatureActions from "./FeatureActions";
import BoundaryAssetsInspector from "./BoundaryAssetsInspector";
import { isPolygonFeature } from "@/lib/spatialAnalysis";

export default function FeaturePanel() {
  const {
    selectedLayer,
    selectedFeature,
    geometryType,
    centroid,
  } = useSelectionStore();

  if (!selectedFeature) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p className="text-sm">Click any feature or polygon boundary on the map to inspect.</p>
      </div>
    );
  }

  const isPolygon = isPolygonFeature(selectedFeature);

  return (
    <div className="space-y-4">
      {/* Feature Header */}
      <FeatureHeader
        layerName={selectedLayer ?? "Unknown"}
        geometryType={geometryType ?? "Unknown"}
        featureId={
          selectedFeature.properties?.id ??
          selectedFeature.properties?.OBJECTID ??
          selectedFeature.id
        }
      />

      {/* Layer-wise Boundary Assets Breakdown (Shown when clicking polygon/boundary) */}
      {isPolygon && <BoundaryAssetsInspector />}

      {/* Centroid / Coordinates */}
      <CoordinateCard centroid={centroid} />

      {/* Feature Attributes */}
      <FeatureAttributes
        properties={selectedFeature.properties ?? {}}
      />

      {/* Actions */}
      <FeatureActions />
    </div>
  );
}