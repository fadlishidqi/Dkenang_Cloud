"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    setIsRefreshing(true);
    startTransition(() => {
      router.refresh();
      // Artificial delay for visual feedback if refresh is too fast
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleRefresh}
      disabled={isRefreshing || isPending}
      className="size-9 text-zinc-500 hover:text-zinc-900 border-zinc-200 bg-white shadow-sm"
      title="Refresh Manual"
    >
      <RotateCw className={`size-4 ${isRefreshing || isPending ? "animate-spin" : ""}`} />
    </Button>
  );
}
