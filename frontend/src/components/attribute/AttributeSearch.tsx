"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function AttributeSearch({
  value,
  onChange,
}: Props) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search records..."
      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
    />
  );
}