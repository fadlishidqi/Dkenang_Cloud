"use client";

import { useEffect, useState } from "react";

export function FormattedDate({ 
  date, 
  showTime = false 
}: { 
  date: Date | string; 
  showTime?: boolean 
}) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    const d = new Date(date);
    setFormatted(
      new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(showTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      }).format(d)
    );
  }, [date, showTime]);

  // Return an empty span or a placeholder during SSR to avoid mismatch
  // Or just return the date string if we can guarantee consistency (hard with locales)
  if (!formatted) {
    return <span className="invisible">Loading...</span>;
  }

  return <span>{formatted}</span>;
}
