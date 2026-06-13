"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";

type Counts = {
  files: number;
  notes: number;
};

const STORAGE_KEY = "dkenang:last-counts";

function readStoredCounts(): Counts | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Counts) : null;
  } catch {
    return null;
  }
}

function writeStoredCounts(counts: Counts) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
}

export function NotificationWatcher({ interval = 5000 }: { interval?: number }) {
  const router = useRouter();
  const latestCounts = useRef<Counts | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkCounts() {
      try {
        const response = await fetch("/api/notifications/counts", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const counts = (await response.json()) as Counts;
        if (!isMounted) {
          return;
        }

        const previous = latestCounts.current ?? readStoredCounts();
        latestCounts.current = counts;
        writeStoredCounts(counts);

        if (!previous) {
          return;
        }

        const newFiles = counts.files - previous.files;
        const newNotes = counts.notes - previous.notes;

        if (newFiles > 0) {
          toast({
            title: `${newFiles} file baru masuk`,
            description: "Daftar file sudah diperbarui.",
          });
        }

        if (newNotes > 0) {
          toast({
            title: `${newNotes} catatan baru masuk`,
            description: "Daftar catatan sudah diperbarui.",
          });
        }

        if (newFiles > 0 || newNotes > 0) {
          router.refresh();
        }
      } catch {
        // Polling notification should stay silent when the connection is flaky.
      }
    }

    void checkCounts();
    const timer = window.setInterval(checkCounts, interval);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, [interval, router]);

  return null;
}
