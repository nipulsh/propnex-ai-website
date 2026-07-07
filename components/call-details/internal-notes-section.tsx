"use client";

import { useState } from "react";
import { Pencil, StickyNote, Trash2 } from "lucide-react";

import { DetailSection } from "@/components/call-details/detail-section";
import { Button } from "@/components/ui/button";
import {
  formatCallDate,
  formatCallTime,
} from "@/lib/call-logs-data";
import { useCallDetailStore } from "@/stores/call-detail-store";
import { usePermissions } from "@/hooks/use-permissions";

export function InternalNotesSection() {
  const { role, branchAccessType, isLoading } = usePermissions();
  const isBranchAdmin = !isLoading && role === "ADMIN" && branchAccessType === "SELECTED";

  const notes = useCallDetailStore((s) => s.internalNotes);
  const addNote = useCallDetailStore((s) => s.addNote);
  const updateNote = useCallDetailStore((s) => s.updateNote);
  const deleteNote = useCallDetailStore((s) => s.deleteNote);

  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleAdd = () => {
    if (!newNote.trim()) return;
    addNote("Current User", newNote.trim());
    setNewNote("");
  };

  const startEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const saveEdit = () => {
    if (editingId && editContent.trim()) {
      updateNote(editingId, editContent.trim());
    }
    setEditingId(null);
    setEditContent("");
  };

  return (
    <DetailSection
      title="Internal Notes"
      description="Team-only notes visible to your organization."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        {!isBranchAdmin && (
          <div className="mb-5 space-y-2">
            <label
              htmlFor="new-note"
              className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
            >
              Add Note
            </label>
            <textarea
              id="new-note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              placeholder="Write an internal note..."
              className="w-full resize-none rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newNote.trim()}
              className="gap-2"
            >
              <StickyNote className="size-4" />
              Add Note
            </Button>
          </div>
        )}

        {notes.length === 0 ? (
          <p className="py-6 text-center text-sm text-propnex-muted">
            No internal notes yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-propnex-border bg-propnex-bg p-4"
              >
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-propnex-border bg-propnex-panel px-3 py-2 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}>
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed text-foreground">
                      {note.content}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-propnex-muted">
                        {note.author} · {formatCallDate(note.createdAt)} at{" "}
                        {formatCallTime(note.createdAt)}
                      </p>
                      {!isBranchAdmin && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => startEdit(note.id, note.content)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </DetailSection>
  );
}
