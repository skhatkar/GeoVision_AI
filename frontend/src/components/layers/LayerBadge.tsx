"use client";

interface Props {
  geometry?: string;
}

export default function LayerBadge({
  geometry,
}: Props) {
  const type = geometry?.toUpperCase() ?? "UNKNOWN";

  const color =
    type.includes("POINT")
      ? "bg-red-100 text-red-700"
      : type.includes("LINE")
      ? "bg-blue-100 text-blue-700"
      : type.includes("POLYGON")
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${color}`}
    >
      {type}
    </span>
  );
}