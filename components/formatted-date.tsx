"use client";

import { useMemo } from "react";

export function FormattedDate({ 
  date, 
  showTime = false 
}: { 
  date: Date | string; 
  showTime?: boolean 
}) {
  const formatted = useMemo(() => {
    const d = new Date(date);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(showTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(d);
  }, [date, showTime]);

  return <span>{formatted}</span>;
}
