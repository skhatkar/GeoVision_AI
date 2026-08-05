"use client";

import { useSelectionStore } from "@/store/selectionStore";

import FeatureHeader from "./FeatureHeader";
import FeatureAttributes from "./FeatureAttributes";
import CoordinateCard from "./CoordinateCard";
import FeatureActions from "./FeatureActions";

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

        Click any feature on the map.

      </div>

    );

  }

  return (

    <div className="space-y-4 p-4">

      <FeatureHeader

        layerName={selectedLayer ?? "Unknown"}

        geometryType={
          geometryType ?? "Unknown"
        }

        featureId={
          selectedFeature.properties?.id ??
          selectedFeature.properties?.OBJECTID ??
          selectedFeature.id
        }

      />

      <CoordinateCard
        centroid={centroid}
      />

      <FeatureAttributes
        properties={
          selectedFeature.properties ?? {}
        }
      />

      <FeatureActions />

    </div>

  );

}