import { getRecentFiles } from "@/lib/dashboard-data";
import { FileGrid, type FileCard } from "./file-grid";
import { FileUploader } from "./file-uploader";

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
    <div className="mt-8 space-y-6">
      <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
        <h3 className="text-lg font-semibold text-white">Upload File</h3>
        <p className="mt-1 text-sm text-zinc-400">
          File disimpan aman di Cloudflare R2.
        </p>
        <div className="mt-4">
          <FileUploader />
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">File Saya</h3>
            <p className="mt-1 text-sm text-zinc-400">
              {files.length} file{query ? ` untuk "${query}"` : ""}
            </p>
          </div>
          <form action="/dashboard/files" className="w-full sm:max-w-xs">
            <input
              className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300/60"
              defaultValue={query}
              name="q"
              placeholder="Cari file..."
            />
          </form>
        </div>
        <div className="mt-5">
          <FileGrid files={cards} />
        </div>
      </section>
    </div>
  );
}
