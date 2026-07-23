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
        flex items-center gap-3
        rounded-xl
        px-4
        py-3
        transition-all
        duration-200

        ${
          active
            ? "bg-primary text-primary-foreground shadow"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }
      `}
    >
      {icon}

      <span className="font-medium">
        {title}
      </span>
    </Link>
  );
}