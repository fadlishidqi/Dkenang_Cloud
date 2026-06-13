"use client";

import { useState, useTransition } from "react";
import { Trash2, Pin, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteNoteAction } from "@/app/actions/notes";
import { FormattedDate } from "@/components/formatted-date";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type NoteCardProps = {
  note: {
    id: string;
    title: string;
    contentHtml: string;
    isPinned: boolean;
    updatedAt: Date;
    tags: { tag: { id: string; name: string } }[];
  };
};

export function NoteCard({ note }: NoteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const handleCopy = () => {
    const text = note.contentHtml.replace(/<[^>]*>/g, "");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmDelete = () => {
    startDelete(async () => {
      const formData = new FormData();
      formData.set("id", note.id);
      await deleteNoteAction(formData);
      setShowDeleteDialog(false);
    });
  };

  return (
    <>
      <Card className="group relative flex min-w-0 flex-col overflow-hidden border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
        <div className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-base font-bold text-zinc-900 group-hover:text-primary">
                  {note.title}
                </h4>
                {note.isPinned && (
                  <Pin className="size-3.5 fill-primary text-primary rotate-45" />
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <FormattedDate date={note.updatedAt} />
                </div>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map(({ tag }) => (
                      <span
                        className="text-[10px] font-bold text-primary"
                        key={tag.id}
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="size-8 text-zinc-400 hover:text-primary hover:bg-primary/10"
                title="Copy Isi"
              >
                {copied ? (
                  <Check className="size-4 text-emerald-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className="size-8 text-zinc-400 hover:text-primary hover:bg-primary/10"
                title={isOpen ? "Minimize" : "Expand"}
              >
                {isOpen ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowDeleteDialog(true)}
                className="size-8 text-zinc-400 hover:text-destructive hover:bg-destructive/10"
                title="Hapus"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          {isOpen ? (
            <div className="mt-3 border-t border-zinc-50 pt-3">
              <div
                className="prose prose-sm max-w-none break-words text-sm leading-relaxed text-zinc-600"
                dangerouslySetInnerHTML={{ __html: note.contentHtml }}
              />
            </div>
          ) : (
            <div className="mt-2">
              <div
                className="line-clamp-1 text-sm text-zinc-500 cursor-pointer hover:text-zinc-700"
                onClick={() => setIsOpen(true)}
                dangerouslySetInnerHTML={{ __html: note.contentHtml }}
              />
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus Catatan</DialogTitle>
            <DialogDescription className="break-words">
              Apakah Anda yakin ingin menghapus catatan <strong>{note.title}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus Catatan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
