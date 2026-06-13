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
    <div className="space-y-4">
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
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          isDragging
            ? "border-cyan-300 bg-cyan-300/10"
            : "border-white/15 bg-black/20 hover:border-cyan-300/50 hover:bg-white/5"
        }`}
      >
        <svg
          aria-hidden
          className="h-10 w-10 text-cyan-200"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5V6m0 0L8.25 9.75M12 6l3.75 3.75M4.5 16.5v1.875c0 1.036.84 1.875 1.875 1.875h11.25c1.035 0 1.875-.84 1.875-1.875V16.5"
          />
        </svg>
        <p className="text-sm font-medium text-white">
          Tarik &amp; lepas file di sini
        </p>
        <p className="text-xs text-zinc-400">
          atau <span className="text-cyan-200">pilih dari perangkat</span> ·
          maks 500 MB
        </p>
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

      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 flex-1 truncate text-sm text-white">
                  {item.name}
                </span>
                <span className="shrink-0 text-xs text-zinc-400">
                  {item.status === "error"
                    ? "Gagal"
                    : item.status === "done"
                      ? "Selesai"
                      : `${item.progress}%`}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.status === "error"
                      ? "bg-red-400"
                      : item.status === "done"
                        ? "bg-emerald-400"
                        : "bg-cyan-300"
                  }`}
                  style={{ width: `${item.status === "error" ? 100 : item.progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {item.error ?? formatBytes(item.size)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
