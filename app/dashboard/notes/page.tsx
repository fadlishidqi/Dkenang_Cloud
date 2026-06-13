import { deleteNoteAction } from "@/app/actions/notes";
import { getRecentNotes } from "@/lib/dashboard-data";
import { NoteForm } from "./note-form";

type NotesPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const notes = await getRecentNotes(query);

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Notes</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Catatan pribadi dengan pin dan tag pencarian.
            </p>
          </div>
          <form action="/dashboard/notes" className="w-full sm:max-w-xs">
            <input
              className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300/60"
              defaultValue={query}
              name="q"
              placeholder="Cari catatan..."
            />
          </form>
        </div>
        <div className="mt-5 grid gap-4">
          {notes.map((note) => (
            <article
              className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
              key={note.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-semibold text-white">{note.title}</h4>
                    {note.isPinned ? (
                      <span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100">
                        Pinned
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Updated {formatDate(note.updatedAt)}
                  </p>
                </div>
                <form action={deleteNoteAction}>
                  <input name="id" type="hidden" value={note.id} />
                  <button className="text-sm text-red-200 hover:text-red-100">Delete</button>
                </form>
              </div>
              <div
                className="mt-4 text-sm leading-6 text-zinc-300"
                dangerouslySetInnerHTML={{ __html: note.contentHtml }}
              />
              {note.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {note.tags.map(({ tag }) => (
                    <span
                      className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-zinc-300"
                      key={tag.id}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
          {notes.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-400">
              Catatan tidak ditemukan.
            </p>
          ) : null}
        </div>
      </section>
      <aside className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white">Tambah Catatan</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Tulis catatan cepat dan tambahkan tag bila perlu.
        </p>
        <div className="mt-5">
          <NoteForm />
        </div>
      </aside>
    </div>
  );
}
