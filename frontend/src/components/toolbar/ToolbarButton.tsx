"use client";

import { Button } from "@/components/ui/button";

interface Props {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}


export default function ToolbarButton({
  icon,
  label,
  active,
  onClick,
}: Props) {

  return (
    <Button
      variant={active ? "default" : "ghost"}
      size="icon"
      title={label}
      onClick={onClick}
      className="h-10 w-10"
    >
      {icon}
    </Button>
  );
}