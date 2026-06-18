"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  confirmUploadAction,
  createUploadUrlAction,
} from "@/app/actions/files";

type UploadStatus = "uploading" | "done" | "error";

type UploadItem = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: UploadStatus;
  error?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

import { UploadCloud, File, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

/** PUT the file to R2 with progress reporting. */
function putToR2(
  url: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload gagal (status ${xhr.status})`));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Koneksi gagal")));
    xhr.addEventListener("abort", () => reject(new Error("Upload dibatalkan")));

    xhr.send(file);
  });
}

export function FileUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const update = useCallback(
    (id: string, patch: Partial<UploadItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const id = crypto.randomUUID();
      setItems((prev) => [
        {
          id,
          name: file.name,
          size: file.size,
          progress: 0,
          status: "uploading",
        },
        ...prev,
      ]);

      try {
        const prepared = await createUploadUrlAction({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          size: file.size,
        });

        if (!prepared.ok) {
          update(id, { status: "error", error: prepared.error });
          return;
        }

        await putToR2(prepared.uploadUrl, file, (percent) =>
          update(id, { progress: percent }),
        );

        const confirmed = await confirmUploadAction({
          key: prepared.key,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          size: file.size,
        });

        if (!confirmed.ok) {
          update(id, { status: "error", error: confirmed.error });
          return;
        }

        update(id, { status: "done", progress: 100 });
        router.refresh();
      } catch (error) {
        update(id, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload gagal",
        });
      }
    },
    [router, update],
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      Array.from(fileList).forEach((file) => void uploadFile(file));
    },
    [uploadFile],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div className="min-w-0 space-y-6">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-4 py-10 text-center transition-all sm:px-6 sm:py-12 ${
          isDragging
            ? "border-primary bg-primary/5 ring-4 ring-primary/5"
            : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50"
        }`}
      >
        <div className="inline-flex size-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200">
          <UploadCloud className={`size-7 ${isDragging ? "text-primary animate-bounce" : "text-zinc-400"}`} />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">
            Tarik & lepas file di sini
          </p>
          <p className="mt-1 text-xs font-medium text-zinc-500">
            atau <span className="text-primary font-bold">pilih dari perangkat</span> · maks 1 GB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="group relative min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                    item.status === "error" ? "bg-red-50 text-red-600" : "bg-zinc-50 text-zinc-600"
                  }`}>
                    {item.status === "uploading" ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : item.status === "error" ? (
                      <AlertCircle className="size-5" />
                    ) : (
                      <CheckCircle2 className="size-5 text-emerald-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-zinc-900">
                      {item.name}
                    </p>
                    <p className="text-xs font-medium text-zinc-500">
                      {formatBytes(item.size)}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    item.status === "error" ? "text-red-600" : "text-zinc-500"
                  }`}>
                    {item.status === "error"
                      ? "Gagal"
                      : item.status === "done"
                        ? "Selesai"
                        : `${item.progress}%`}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.status === "error"
                      ? "bg-red-500"
                      : item.status === "done"
                        ? "bg-emerald-500"
                        : "bg-primary"
                  }`}
                  style={{ width: `${item.status === "error" ? 100 : item.progress}%` }}
                />
              </div>
              
              {item.error && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {item.error}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
