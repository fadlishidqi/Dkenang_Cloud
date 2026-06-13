"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export type NoteActionState = {
  error?: string;
};

function toSafeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replace(/\r?\n/g, "<br />");
}

export async function createNoteAction(
  _prevState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const tagNames = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 10);

  if (!title || !content) {
    return { error: "Judul dan isi catatan wajib diisi." };
  }

  await prisma.note.create({
    data: {
      title,
      contentHtml: toSafeHtml(content),
      isPinned: formData.get("isPinned") === "on",
      tags: {
        create: tagNames.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notes");
  return {};
}

export async function deleteNoteAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "");

  if (id) {
    await prisma.note.delete({ where: { id } });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notes");
  }
}
