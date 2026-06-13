"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LayoutDashboard, FolderOpen, PenLine } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/files", label: "Files", icon: FolderOpen },
  { href: "/dashboard/notes", label: "Notes", icon: PenLine },
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
          ? "flex gap-2 overflow-x-auto text-sm text-zinc-500"
          : "space-y-1 text-sm text-zinc-500"
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
            className={`flex items-center gap-2 rounded-md px-3 py-2 transition ${
              isHorizontal ? "whitespace-nowrap" : "w-full"
            } ${isActive ? "bg-zinc-100 text-zinc-900 font-medium shadow-sm" : "hover:bg-zinc-100 hover:text-zinc-900"}`}
            href={item.href}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
