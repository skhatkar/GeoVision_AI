"use client";

import {
  Layers3,
  Shapes,
  Hash,
} from "lucide-react";

interface Props {
  layerName: string;
  geometryType: string;
  featureId?: string | number;
}

export default function FeatureHeader({
  layerName,
  geometryType,
  featureId,
}: Props) {
  return (
    <div className="space-y-4">

      <div>

        <h2 className="text-lg font-semibold">
          Feature Details
        </h2>

        <p className="text-sm text-muted-foreground">
          Selected GIS Feature
        </p>

      </div>

      <div className="space-y-3 rounded-xl border bg-card p-4">

        <div className="flex items-center gap-3">

          <Layers3
            size={18}
            className="text-sky-600"
          />

          <div>

            <p className="text-xs text-muted-foreground">
              Layer
            </p>

            <p className="font-medium">
              {layerName}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <Shapes
            size={18}
            className="text-green-600"
          />

          <div>

            <p className="text-xs text-muted-foreground">
              Geometry
            </p>

            <p className="font-medium">
              {geometryType}
            </p>

          </div>

        </div>

        {featureId && (

          <div className="flex items-center gap-3">

            <Hash
              size={18}
              className="text-orange-500"
            />

            <div>

              <p className="text-xs text-muted-foreground">
                Feature ID
              </p>

              <p className="font-medium">
                {featureId}
              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}