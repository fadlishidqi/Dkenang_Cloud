"use client";

import { useState } from "react";
import { getFileUrlAction } from "@/app/actions/files";

import { File, Loader2 } from "lucide-react";

export function RecentFileLink({
  id,
  fileName,
  meta,
}: {
  id: string;
  fileName: string;
  meta: React.ReactNode;
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
      className="group flex w-full min-w-0 items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition hover:bg-zinc-100 hover:border-zinc-200 disabled:opacity-60 sm:px-3"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400 group-hover:bg-white group-hover:text-primary transition-colors">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <File className="size-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-zinc-900 group-hover:text-primary transition-colors">
          {fileName}
        </p>
        <p className="truncate text-[11px] font-medium text-zinc-500">
          {busy ? "Menyiapkan..." : error ?? meta}
        </p>
      </div>
    </button>
  );
}
