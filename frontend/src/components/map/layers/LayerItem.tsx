"use client";

import { Eye, EyeOff } from "lucide-react";

interface Props {
  name: string;
  visible: boolean;
  onToggle: () => void;
}

export default function LayerItem({
  name,
  visible,
  onToggle,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40">

      <span>{name}</span>

      <button onClick={onToggle}>
        {visible ? (
          <Eye className="h-5 w-5 text-sky-500" />
        ) : (
          <EyeOff className="h-5 w-5 text-zinc-400" />
        )}
      </button>

    </div>
  );
}