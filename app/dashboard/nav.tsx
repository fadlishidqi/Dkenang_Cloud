"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/files", label: "Files" },
  { href: "/dashboard/notes", label: "Notes" },
];

export function DashboardNav({
  orientation = "vertical",
}: {
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();
  const isHorizontal = orientation === "horizontal";

  return (
    <nav
      className={
        isHorizontal
          ? "flex gap-2 overflow-x-auto text-sm text-zinc-300"
          : "mt-10 space-y-2 text-sm text-zinc-300"
      }
    >
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            className={`rounded-md px-3 py-2 transition ${
              isHorizontal ? "whitespace-nowrap" : "block"
            } ${isActive ? "bg-white/10 text-white" : "hover:bg-white/10"}`}
            href={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
