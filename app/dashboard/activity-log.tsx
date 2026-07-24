"use client";

import { useState, useMemo } from "react";
import { Clock, Activity, ChevronDown } from "lucide-react";
import { FormattedDate } from "@/components/formatted-date";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Log = {
  id: string;
  username: string;
  action: string;
  target: string;
  createdAt: Date | string;
};

export function ActivityLog({ initialLogs }: { initialLogs: Log[] }) {
  const [displayCount, setDisplayCount] = useState(5);

  const visibleLogs = useMemo(() => initialLogs.slice(0, displayCount), [initialLogs, displayCount]);
  const hasMore = initialLogs.length > displayCount;

  return (
    <Card className="flex h-full min-w-0 flex-col border-zinc-200 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-4 sm:items-center sm:p-6 sm:pb-4">
        <CardTitle className="text-lg font-bold text-zinc-900">Log Aktivitas</CardTitle>
        <div className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Tracking
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="space-y-4 flex-1">
          {visibleLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3">
              <div className="mt-0.5 size-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-zinc-500 uppercase">
                {log.username.substring(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-bold text-zinc-900">
                  {log.username} <span className="font-normal text-zinc-500">melakukan</span> {log.action}
                </p>
                <p className="truncate text-xs italic text-zinc-600">&quot;{log.target}&quot;</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-zinc-400">
                  <Clock className="size-2.5" />
                  <FormattedDate date={log.createdAt} showTime />
                </div>
              </div>
            </div>
          ))}
          
          {initialLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity className="size-8 text-zinc-200 mb-2" />
              <p className="text-sm font-medium text-zinc-500">Belum ada aktivitas.</p>
            </div>
          )}
        </div>

        {hasMore && (
          <div className="mt-6 pt-4 border-t border-zinc-100">
            <Button 
              variant="ghost" 
              className="w-full text-xs font-bold text-zinc-500 hover:text-primary hover:bg-zinc-50 gap-2"
              onClick={() => setDisplayCount(prev => prev + 5)}
            >
              Lihat Lebih Banyak <ChevronDown className="size-3" />
            </Button>
          </div>
        )}
        
        {!hasMore && initialLogs.length > 5 && (
          <div className="mt-6 pt-4 border-t border-zinc-100">
            <Button 
              variant="ghost" 
              className="w-full text-xs font-bold text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 gap-2"
              onClick={() => setDisplayCount(5)}
            >
              Tampilkan Sedikit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
