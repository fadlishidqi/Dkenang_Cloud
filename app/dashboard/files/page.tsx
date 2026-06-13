import { getRecentFiles } from "@/lib/dashboard-data";
import { FileGrid, type FileCard } from "./file-grid";
import { FileUploader } from "./file-uploader";

export const dynamic = "force-dynamic";

type FilesPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

function formatBytes(value: bigint) {
  const bytes = Number(value);

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

import { Search, FolderOpen, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function FilesPage({ searchParams }: FilesPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const files = await getRecentFiles(query);

  const cards: FileCard[] = files.map((file) => ({
    id: file.id,
    fileName: file.fileName,
    mimeType: file.mimeType,
    sizeText: formatBytes(file.sizeBytes),
    dateText: formatDate(file.createdAt),
  }));

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-zinc-900">Upload Baru</h3>
          <p className="text-sm text-zinc-500">
            File disimpan aman di Cloudflare R2.
          </p>
        </div>
        <FileUploader />
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 border-t border-zinc-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-zinc-900">File Saya</h3>
            <p className="text-sm text-zinc-500">
              {files.length} file tersimpan {query ? ` ditemukan untuk "${query}"` : ""}
            </p>
          </div>
          <form action="/dashboard/files" className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              className="pl-9 bg-white border-zinc-200"
              defaultValue={query}
              name="q"
              placeholder="Cari file..."
            />
          </form>
        </div>
        <FileGrid files={cards} />
      </section>
    </div>
  );
}
