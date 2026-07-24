import "server-only";

import { prisma } from "@/lib/prisma";

export async function getDashboardCounts() {
  const [files, notes] = await Promise.all([
    prisma.file.count(),
    prisma.note.count(),
  ]);

  return { files, notes };
}

/**
 * Cheap change-detection token for the client poller. The audit log id covers
 * edits and deletes, which the two counts alone would miss — it rides the
 * `createdAt` index, so this stays three small queries no matter how much the
 * tables grow.
 */
export async function getNotificationSignature() {
  const [files, notes, lastLog] = await Promise.all([
    prisma.file.count(),
    prisma.note.count(),
    prisma.auditLog.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true },
    }),
  ]);

  return { files, notes, lastLogId: lastLog?.id ?? null };
}

export async function getStorageUsage() {
  const result = await prisma.file.aggregate({
    _sum: {
      sizeBytes: true,
    },
  });
  
  return Number(result._sum.sizeBytes || 0);
}

export async function getAuditLogs() {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
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
