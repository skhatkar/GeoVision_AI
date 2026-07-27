"use client";

import { Eye, EyeOff } from "lucide-react";

interface Props {
  name: string;
  visible: boolean;
  color: string;
}

export default function LayerRow({
  name,
  visible,
  color,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition">

      <div className="flex items-center gap-3">

        <div
          className="h-3 w-3 rounded-full"
          style={{ background: color }}
        />

        <span>{name}</span>

      </div>

      {visible ? (
        <Eye className="h-5 w-5 cursor-pointer text-sky-500" />
      ) : (
        <EyeOff className="h-5 w-5 cursor-pointer text-muted-foreground" />
      )}

    </div>
  );
}