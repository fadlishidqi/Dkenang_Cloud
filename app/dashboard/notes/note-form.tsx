"use client";

import { useActionState } from "react";
import { createNoteAction, type NoteActionState } from "@/app/actions/notes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: NoteActionState = {};

export function NoteForm() {
  const [state, formAction, isPending] = useActionState(
    createNoteAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-semibold text-zinc-700">Judul</label>
        <Input
          id="title"
          className="bg-zinc-50 border-zinc-200 focus:bg-white"
          name="title"
          placeholder="Judul catatan"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-semibold text-zinc-700">Isi</label>
        <Textarea
          id="content"
          className="min-h-32 bg-zinc-50 border-zinc-200 focus:bg-white"
          name="content"
          placeholder="Tulis pemikiran Anda di sini..."
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="tags" className="text-sm font-semibold text-zinc-700">Tag (Opsional)</label>
        <Input
          id="tags"
          className="bg-zinc-50 border-zinc-200 focus:bg-white"
          name="tags"
          placeholder="kerja, pribadi, inspirasi..."
        />
      </div>
      <div className="flex items-center gap-2 py-2">
        <input
          id="isPinned"
          className="size-4 rounded border-zinc-300 text-primary focus:ring-primary"
          name="isPinned"
          type="checkbox"
        />
        <label htmlFor="isPinned" className="text-sm font-medium text-zinc-600">
          Sematkan catatan (Pin)
        </label>
      </div>
      {state.error ? (
        <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive font-medium">
          {state.error}
        </p>
      ) : null}
      <Button
        className="w-full font-bold shadow-sm"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Menyimpan..." : "Simpan Catatan"}
      </Button>
    </form>
  );
}
