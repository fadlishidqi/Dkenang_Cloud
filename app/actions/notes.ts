"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export type NoteActionState = {
  error?: string;
};

async function logActivity(action: string, target: string) {
  const session = await getSession();
  if (session?.username) {
    await prisma.auditLog.create({
      data: {
        username: session.username,
        action,
        target,
      },
    });
  }
}

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

  await logActivity("Buat Catatan", title);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notes");
  return {};
}

export async function deleteNoteAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "");

  if (id) {
    const note = await prisma.note.findUnique({ where: { id } });
    await prisma.note.delete({ where: { id } });
    if (note) {
      await logActivity("Hapus Catatan", note.title);
    }
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notes");
  }
}
