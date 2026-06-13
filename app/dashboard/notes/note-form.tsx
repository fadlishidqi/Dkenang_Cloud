"use client";

import { useActionState } from "react";
import { createNoteAction, type NoteActionState } from "@/app/actions/notes";

const initialState: NoteActionState = {};

export function NoteForm() {
  const [state, formAction, isPending] = useActionState(
    createNoteAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input
        className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300/60"
        name="title"
        placeholder="Judul catatan"
        required
      />
      <textarea
        className="min-h-32 w-full resize-y rounded-md border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300/60"
        name="content"
        placeholder="Isi catatan"
        required
      />
      <input
        className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300/60"
        name="tags"
        placeholder="Tag dipisah koma"
      />
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          className="size-4 rounded border-white/10 bg-black/20"
          name="isPinned"
          type="checkbox"
        />
        Pin catatan
      </label>
      {state.error ? (
        <p className="rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      <button
        className="h-10 w-full rounded-md bg-cyan-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Menyimpan..." : "Simpan catatan"}
      </button>
    </form>
  );
}
