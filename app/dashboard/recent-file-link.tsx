"use client";

import { useState } from "react";
import { getFileUrlAction } from "@/app/actions/files";

export function RecentFileLink({
  id,
  fileName,
  meta,
}: {
  id: string;
  fileName: string;
  meta: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setBusy(true);
    setError(null);
    const result = await getFileUrlAction(id);
    setBusy(false);
    if (result.ok && result.url) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      setError(result.error ?? "Gagal membuka file.");
    }
  }

  return (
    <button
      onClick={open}
      disabled={busy}
      className="block w-full rounded-md border border-white/10 bg-black/20 px-3 py-3 text-left transition hover:bg-black/30 disabled:opacity-60"
    >
      <p className="truncate text-sm font-medium text-white">{fileName}</p>
      <p className="mt-1 text-xs text-zinc-400">
        {busy ? "Menyiapkan..." : error ?? meta}
      </p>
    </button>
  );
}
