"use client";

interface Props {
  geometryType?: string;
  color: string;
}

export default function LayerLegend({
  geometryType,
  color,
}: Props) {
  const type =
    geometryType?.toLowerCase() ?? "";

  if (type.includes("point")) {
    return (
      <div
        className="h-3 w-3 rounded-full"
        style={{
          background: color,
        }}
      />
    );
  }

  if (type.includes("line")) {
    return (
      <div
        className="h-[3px] w-4 rounded-full"
        style={{
          background: color,
        }}
      />
    );
  }

  return (
    <div
      className="h-3 w-3 rounded-sm border"
      style={{
        background: color,
      }}
    />
  );
}