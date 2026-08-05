"use client";

interface Props {
  properties: Record<string, any>;
}

export default function FeatureAttributes({
  properties,
}: Props) {

  return (

    <div className="rounded-xl border bg-card p-4">

      <h3 className="mb-4 font-semibold">
        Attributes
      </h3>

      <div className="space-y-2">

        {Object.entries(properties).map(
          ([key, value]) => (

            <div
              key={key}
              className="flex justify-between border-b pb-2 text-sm"
            >

              <span className="font-medium text-muted-foreground">
                {key}
              </span>

              <span className="text-right">
                {String(value)}
              </span>

            </div>

          )
        )}

      </div>

    </div>

  );
}