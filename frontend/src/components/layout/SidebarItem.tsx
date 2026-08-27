"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  href: string;
  icon: React.ReactNode;
  title: string;
}

export default function SidebarItem({
  href,
  icon,
  title,
}: Props) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`
        group
        relative
        flex items-center gap-3
        rounded-xl
        px-3.5
        py-2.5
        text-sm
        font-medium
        transition-all
        duration-200
        ${
          active
            ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/25 translate-x-1"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:translate-x-1"
        }
      `}
    >
      {/* Active Left Indicator Bar */}
      {active && (
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
      )}

      <span className={`transition-transform duration-200 group-hover:scale-110 ${active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"}`}>
        {icon}
      </span>

      <span className="truncate">
        {title}
      </span>
    </Link>
  );
}