"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFileAction, getFileUrlAction } from "@/app/actions/files";
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileArchive, 
  FileCode, 
  Download, 
  Trash2, 
  Loader2,
  File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type FileCard = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeText: string;
  dateText: string;
};

function FileIcon({ mime, className }: { mime: string; className?: string }) {
  if (mime.startsWith("image/")) return <ImageIcon className={className} />;
  if (mime.startsWith("video/")) return <Video className={className} />;
  if (mime.startsWith("audio/")) return <Music className={className} />;
  if (mime === "application/pdf") return <FileText className={className} />;
  if (mime.includes("word") || mime.includes("document")) return <FileText className={className} />;
  if (mime.includes("sheet") || mime.includes("excel") || mime === "text/csv") return <FileText className={className} />;
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("compressed")) return <FileArchive className={className} />;
  if (mime.startsWith("text/")) return <FileCode className={className} />;
  return <File className={className} />;
}

function fileTone(mime: string): string {
  if (mime.startsWith("image/")) return "bg-blue-50 text-blue-600 border-blue-100";
  if (mime.startsWith("video/")) return "bg-purple-50 text-purple-600 border-purple-100";
  if (mime.startsWith("audio/")) return "bg-amber-50 text-amber-600 border-amber-100";
  if (mime === "application/pdf") return "bg-red-50 text-red-600 border-red-100";
  if (mime.includes("zip") || mime.includes("rar")) return "bg-orange-50 text-orange-600 border-orange-100";
  return "bg-zinc-50 text-zinc-600 border-zinc-100";
}

function FileCardItem({ file }: { file: FileCard }) {
  const router = useRouter();
  const tone = fileTone(file.mimeType);
  const [isOpening, setIsOpening] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setIsOpening(true);
    setError(null);
    const result = await getFileUrlAction(file.id);
    setIsOpening(false);
    if (result.ok && result.url) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      setError(result.error ?? "Gagal membuka file.");
    }
  }

  function confirmDelete() {
    startDelete(async () => {
      const formData = new FormData();
      formData.set("id", file.id);
      await deleteFileAction(formData);
      setShowDeleteDialog(false);
      router.refresh();
    });
  }

  return (
    <>
      <Card className="group relative flex min-w-0 flex-col border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className={`flex size-12 items-center justify-center rounded-xl border ${tone}`}>
            <FileIcon mime={file.mimeType} className="size-6" />
          </div>
          <div className="flex shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <Button
              size="icon"
              variant="ghost"
              className="size-8 text-zinc-400 hover:text-zinc-900"
              onClick={handleDownload}
              disabled={isOpening}
              title="Download"
            >
              {isOpening ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 text-zinc-400 hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              title="Hapus"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 min-w-0">
          <p className="truncate text-sm font-bold text-zinc-900" title={file.fileName}>
            {file.fileName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-zinc-500">
            <span>{file.sizeText}</span>
            <span>•</span>
            <span>{file.dateText}</span>
          </div>
        </div>

        {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus File</DialogTitle>
            <DialogDescription className="break-words">
              Apakah Anda yakin ingin menghapus <strong>{file.fileName}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FileGrid({ files }: { files: FileCard[] }) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-16 text-center">
        <div className="inline-flex size-12 items-center justify-center rounded-full bg-white shadow-sm mb-4">
          <File className="size-6 text-zinc-400" />
        </div>
        <p className="text-sm font-medium text-zinc-500">
          Belum ada file. Unggah file pertama Anda di atas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {files.map((file) => (
        <FileCardItem key={file.id} file={file} />
      ))}
    </div>
  );
}
