"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";

type Signature = {
  files: number;
  notes: number;
  lastLogId: string | null;
};

/**
 * Single poller for the whole dashboard. It only calls `router.refresh()` when
 * the server signature actually moved, so an idle tab costs one tiny request
 * per interval instead of a full re-render of every route segment.
 */
export function NotificationWatcher({
  interval = 30_000,
}: {
  interval?: number;
}) {
  const router = useRouter();
  const latest = useRef<Signature | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let timer: number | undefined;

    async function check() {
      // A hidden tab has nothing to show the user, and every poll we skip is a
      // serverless invocation plus three DB round trips we don't pay for.
      if (document.visibilityState === "hidden" || inFlight.current) {
        return;
      }

      inFlight.current = true;

      try {
        const response = await fetch("/api/notifications/counts", {
          cache: "no-store",
        });

        if (!response.ok || !isMounted) {
          return;
        }

        const next = (await response.json()) as Signature;

        if (!isMounted) {
          return;
        }

        const previous = latest.current;
        latest.current = next;

        // The first poll only establishes a baseline: the page was just server
        // rendered, so its data already matches. Refreshing here would repeat
        // work we just finished, on every single page load.
        if (!previous) {
          return;
        }

        const newFiles = next.files - previous.files;
        const newNotes = next.notes - previous.notes;

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

        // Refresh on any movement, not just additions — edits and deletes leave
        // the counts alone and only show up as a new audit log id.
        const changed =
          next.files !== previous.files ||
          next.notes !== previous.notes ||
          next.lastLogId !== previous.lastLogId;

        if (changed) {
          router.refresh();
        }
      } catch {
        // Polling should stay silent when the connection is flaky.
      } finally {
        inFlight.current = false;
      }
    }

    function start() {
      if (timer === undefined) {
        timer = window.setInterval(check, interval);
      }
    }

    function stop() {
      if (timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        // Catch up right away so coming back to the tab feels instant.
        void check();
        start();
      } else {
        stop();
      }
    }

    if (document.visibilityState === "visible") {
      void check();
      start();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      stop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [interval, router]);

  return null;
}
