import { getDashboardCounts, getRecentFiles, getRecentNotes, getStorageUsage, getAuditLogs } from "@/lib/dashboard-data";
import { RecentFileLink } from "./recent-file-link";
import { ActivityLog } from "./activity-log";
import { FormattedDate } from "@/components/formatted-date";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FolderOpen, PenLine, Database, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default async function DashboardPage() {
  const [counts, files, notes, storageUsed, logs] = await Promise.all([
    getDashboardCounts(),
    getRecentFiles(),
    getRecentNotes(),
    getStorageUsage(),
    getAuditLogs(),
  ]);

  const maxStorage = 8 * 1024 * 1024 * 1024; // 8GB
  const storagePercent = Math.min(100, Math.round((storageUsed / maxStorage) * 100));

  const stats = [
    { label: "Files", value: counts.files, hint: "Metadata file tersimpan", icon: FolderOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Notes", value: counts.notes, hint: "Catatan pribadi aktif", icon: PenLine, color: "text-purple-600", bg: "bg-purple-50" },
    { 
      label: "Storage", 
      value: `${formatBytes(storageUsed)} / 8GB`, 
      hint: `${storagePercent}% terpakai`, 
      icon: Database, 
      color: storagePercent > 90 ? "text-red-600" : "text-emerald-600", 
      bg: storagePercent > 90 ? "bg-red-50" : "bg-emerald-50",
      progress: storagePercent
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label} className="min-w-0 border-zinc-200 shadow-sm transition hover:shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-500">{item.label}</p>
                  <p className="mt-1 break-words text-xl font-bold text-zinc-900 sm:text-2xl">{item.value}</p>
                </div>
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl sm:size-12 ${item.bg} ${item.color}`}>
                  <item.icon className="size-6" />
                </div>
              </div>
              {item.progress !== undefined ? (
                <div className="mt-4">
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.progress > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs font-medium text-zinc-400">{item.hint}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <ActivityLog initialLogs={logs.map(log => ({
          ...log,
          createdAt: log.createdAt.toISOString()
        }))} />

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 p-4 pb-4 sm:p-6 sm:pb-4">
            <CardTitle className="text-lg font-bold text-zinc-900">File Terbaru</CardTitle>
            <Link 
              href="/dashboard/files" 
              className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            >
              Semua <ArrowUpRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="space-y-1">
              {files.slice(0, 5).map((file) => (
                <RecentFileLink
                  key={file.id}
                  id={file.id}
                  fileName={file.fileName}
                  meta={
                    <>
                      {file.mimeType} · <FormattedDate date={file.createdAt} />
                    </>
                  }
                />
              ))}
              {files.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <FolderOpen className="size-8 text-zinc-200 mb-2" />
                  <p className="text-sm font-medium text-zinc-500">Belum ada file.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 p-4 pb-4 sm:p-6 sm:pb-4">
            <CardTitle className="text-lg font-bold text-zinc-900">Catatan Terbaru</CardTitle>
            <Link 
              href="/dashboard/notes" 
              className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            >
              Semua <ArrowUpRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {notes.slice(0, 6).map((note) => (
                <Link
                  key={note.id}
                  href="/dashboard/notes"
                  className="group flex flex-col rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 transition hover:border-zinc-200 hover:bg-zinc-50"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="truncate text-sm font-bold text-zinc-900 group-hover:text-primary transition-colors">
                      {note.title}
                    </p>
                    {note.isPinned && <PenLine className="size-3 text-primary" />}
                  </div>
                  <div 
                    className="line-clamp-1 text-xs text-zinc-500 mb-3"
                    dangerouslySetInnerHTML={{ __html: note.contentHtml }}
                  />
                  <div className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <FormattedDate date={note.updatedAt} />
                  </div>
                </Link>
              ))}
              {notes.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                  <PenLine className="size-8 text-zinc-200 mb-2" />
                  <p className="text-sm font-medium text-zinc-500">Belum ada catatan.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
