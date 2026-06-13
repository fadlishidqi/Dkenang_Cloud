"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFileAction, getFileUrlAction } from "@/app/actions/files";

export type FileCard = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeText: string;
  dateText: string;
};

function fileKind(mime: string): { label: string; tone: string } {
  if (mime.startsWith("image/")) return { label: "IMG", tone: "bg-pink-400/20 text-pink-200" };
  if (mime.startsWith("video/")) return { label: "VID", tone: "bg-purple-400/20 text-purple-200" };
  if (mime.startsWith("audio/")) return { label: "AUD", tone: "bg-amber-400/20 text-amber-200" };
  if (mime === "application/pdf") return { label: "PDF", tone: "bg-red-400/20 text-red-200" };
  if (mime.includes("word") || mime.includes("document"))
    return { label: "DOC", tone: "bg-blue-400/20 text-blue-200" };
  if (mime.includes("sheet") || mime.includes("excel") || mime === "text/csv")
    return { label: "XLS", tone: "bg-emerald-400/20 text-emerald-200" };
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("compressed"))
    return { label: "ZIP", tone: "bg-yellow-400/20 text-yellow-200" };
  if (mime.startsWith("text/")) return { label: "TXT", tone: "bg-zinc-400/20 text-zinc-200" };
  return { label: "FILE", tone: "bg-cyan-400/20 text-cyan-200" };
}

function FileCardItem({ file }: { file: FileCard }) {
  const router = useRouter();
  const kind = fileKind(file.mimeType);
  const [busy, setBusy] = useState<"open" | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setBusy("open");
    setError(null);
    const result = await getFileUrlAction(file.id);
    setBusy(null);
    if (result.ok && result.url) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      setError(result.error ?? "Gagal membuka file.");
    }
  }

  function remove() {
    if (!window.confirm(`Hapus "${file.fileName}"?`)) return;
    startDelete(async () => {
      const formData = new FormData();
      formData.set("id", file.id);
      await deleteFileAction(formData);
      router.refresh();
    });
  }

  return (
    <div className="group flex flex-col rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/40 hover:bg-white/10">
      <div className="flex items-start justify-between">
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-lg text-xs font-bold ${kind.tone}`}
        >
          {kind.label}
        </span>
        <button
          onClick={remove}
          disabled={isDeleting}
          title="Hapus"
          className="rounded-md p-1.5 text-zinc-500 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h12M9.5 7.5V6a1.5 1.5 0 011.5-1.5h2A1.5 1.5 0 0114.5 6v1.5m-7 0 .6 11A1.5 1.5 0 0 0 9.6 20h4.8a1.5 1.5 0 0 0 1.5-1.4l.6-11" />
          </svg>
        </button>
      </div>
      <button
        onClick={open}
        disabled={busy === "open"}
        className="mt-3 text-left"
        title={file.fileName}
      >
        <p className="truncate text-sm font-medium text-white group-hover:text-cyan-100">
          {file.fileName}
        </p>
      </button>
      <p className="mt-1 text-xs text-zinc-500">
        {busy === "open" ? "Menyiapkan..." : `${file.sizeText} · ${file.dateText}`}
      </p>
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

export function FileGrid({ files }: { files: FileCard[] }) {
  if (files.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 px-4 py-16 text-center text-sm text-zinc-400">
        Belum ada file. Unggah file pertama Anda di atas.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {files.map((file) => (
        <FileCardItem key={file.id} file={file} />
      ))}
    </div>
  );
}
