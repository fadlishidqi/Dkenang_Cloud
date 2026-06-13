import "server-only";

import { prisma } from "@/lib/prisma";

export async function getDashboardCounts() {
  const [files, notes, tags] = await Promise.all([
    prisma.file.count(),
    prisma.note.count(),
    prisma.tag.count(),
  ]);

  return { files, notes, tags };
}

export async function getRecentFiles(query = "") {
  return prisma.file.findMany({
    where: query
      ? {
          OR: [
            { fileName: { contains: query } },
            { mimeType: { contains: query } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { folder: true },
  });
}

export async function getRecentNotes(query = "") {
  return prisma.note.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query } },
            { contentHtml: { contains: query } },
            { tags: { some: { tag: { name: { contains: query } } } } },
          ],
        }
      : undefined,
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    take: 30,
    include: { tags: { include: { tag: true } } },
  });
}
