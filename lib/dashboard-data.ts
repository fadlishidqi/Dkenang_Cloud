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
            { fileName: { contains: query, mode: "insensitive" } },
            { mimeType: { contains: query, mode: "insensitive" } },
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
            { title: { contains: query, mode: "insensitive" } },
            { contentHtml: { contains: query, mode: "insensitive" } },
            { tags: { some: { tag: { name: { contains: query, mode: "insensitive" } } } } },
          ],
        }
      : undefined,
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    take: 30,
    include: { tags: { include: { tag: true } } },
  });
}
