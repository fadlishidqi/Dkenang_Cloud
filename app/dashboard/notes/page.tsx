import { getRecentNotes } from "@/lib/dashboard-data";
import { NoteForm } from "./note-form";
import { NoteCard } from "./note-card";
import { RealtimeSync } from "@/components/realtime-sync";
import { FormattedDate } from "@/components/formatted-date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, Pin, PenLine } from "lucide-react";

export const dynamic = "force-dynamic";

type NotesPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const notes = await getRecentNotes(query);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <RealtimeSync />
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-zinc-900">Catatan</h3>
            <p className="text-sm text-zinc-500">
              Kelola ide dan pengingat Anda.
            </p>
          </div>
          <form action="/dashboard/notes" className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              className="pl-9 bg-white border-zinc-200"
              defaultValue={query}
              name="q"
              placeholder="Cari catatan..."
            />
          </form>
        </div>

        <div className="grid gap-3">
          {notes.map((note) => (
            <NoteCard 
              key={note.id} 
              note={note} 
            />
          ))}
          {notes.length === 0 && (
            <div className="col-span-full rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-16 text-center">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                <PenLine className="size-6 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-500">
                Belum ada catatan. Mulai tulis ide Anda!
              </p>
            </div>
          )}
        </div>
      </section>

      <aside>
        <Card className="sticky top-6 border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-zinc-900">Tambah Catatan</h3>
            <p className="text-sm text-zinc-500">
              Simpan pemikiran Anda dengan cepat.
            </p>
          </div>
          <NoteForm />
        </Card>
      </aside>
    </div>
  );
}
