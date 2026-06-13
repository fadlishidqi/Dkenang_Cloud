"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastPayload = {
  title: string;
  description?: string;
};

type ToastItem = ToastPayload & {
  id: string;
};

const TOAST_EVENT = "dkenang:toast";

export function toast(payload: ToastPayload) {
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }));
}

export function Toaster() {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    function onToast(event: Event) {
      const payload = (event as CustomEvent<ToastPayload>).detail;
      setItems((current) => [
        ...current,
        {
          ...payload,
          id: crypto.randomUUID(),
        },
      ]);
    }

    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {items.map((item) => (
        <ToastPrimitive.Root
          key={item.id}
          className={cn(
            "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 text-zinc-900 shadow-lg",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-2 data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full",
          )}
          duration={4500}
          onOpenChange={(open) => {
            if (!open) {
              setItems((current) => current.filter((toastItem) => toastItem.id !== item.id));
            }
          }}
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <ToastPrimitive.Title className="break-words text-sm font-bold">
              {item.title}
            </ToastPrimitive.Title>
            {item.description ? (
              <ToastPrimitive.Description className="mt-1 break-words text-xs font-medium text-zinc-500">
                {item.description}
              </ToastPrimitive.Description>
            ) : null}
          </div>
          <ToastPrimitive.Close className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900">
            <X className="size-4" />
            <span className="sr-only">Tutup</span>
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 outline-none sm:bottom-6 sm:right-6" />
    </ToastPrimitive.Provider>
  );
}
