import { getDashboardCounts, getRecentFiles, getRecentNotes } from "@/lib/dashboard-data";
import { RecentFileLink } from "./recent-file-link";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function DashboardPage() {
  const [counts, files, notes] = await Promise.all([
    getDashboardCounts(),
    getRecentFiles(),
    getRecentNotes(),
  ]);

  const stats = [
    { label: "Files", value: counts.files, hint: "Metadata file tersimpan" },
    { label: "Notes", value: counts.notes, hint: "Catatan pribadi aktif" },
    { label: "Tags", value: counts.tags, hint: "Label untuk pencarian" },
  ];

  return (
    <>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-xl shadow-black/20 backdrop-blur-xl"
          >
            <p className="text-sm text-zinc-400">{item.label}</p>
            <p className="mt-3 text-4xl font-semibold text-white">{item.value}</p>
            <p className="mt-3 text-sm text-zinc-300">{item.hint}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">Recent Files</h3>
            <a className="text-sm text-cyan-200 hover:text-cyan-100" href="/dashboard/files">
              View all
            </a>
          </div>
          <div className="mt-4 space-y-3">
            {files.slice(0, 5).map((file) => (
              <RecentFileLink
                key={file.id}
                id={file.id}
                fileName={file.fileName}
                meta={`${file.mimeType} · ${formatDate(file.createdAt)}`}
              />
            ))}
            {files.length === 0 ? (
              <p className="rounded-md border border-dashed border-white/10 px-3 py-6 text-center text-sm text-zinc-400">
                Belum ada file.
              </p>
            ) : null}
          </div>
        </section>
        <section className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">Recent Notes</h3>
            <a className="text-sm text-cyan-200 hover:text-cyan-100" href="/dashboard/notes">
              View all
            </a>
          </div>
          <div className="mt-4 space-y-3">
            {notes.slice(0, 5).map((note) => (
              <article
                className="rounded-md border border-white/10 bg-black/20 px-3 py-3"
                key={note.id}
              >
                <p className="text-sm font-medium text-white">{note.title}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  {note.isPinned ? "Pinned · " : ""}
                  {formatDate(note.updatedAt)}
                </p>
              </article>
            ))}
            {notes.length === 0 ? (
              <p className="rounded-md border border-dashed border-white/10 px-3 py-6 text-center text-sm text-zinc-400">
                Belum ada catatan.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
