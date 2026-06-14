"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";

type LanguageTagsInputProps = {
  languages: string[];
  onAdd: (language: string) => void;
  onRemove: (language: string) => void;
};

export function LanguageTagsInput({
  languages,
  onAdd,
  onRemove,
}: LanguageTagsInputProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function handleAdd() {
    if (draft.trim()) {
      onAdd(draft);
      setDraft("");
      setIsAdding(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {languages.map((language) => (
        <span
          key={language}
          className="inline-flex items-center gap-1.5 rounded-lg border border-propnex-border bg-propnex-bg px-2.5 py-1.5 text-xs text-foreground"
        >
          {language}
          <button
            type="button"
            onClick={() => onRemove(language)}
            className="text-propnex-muted transition-colors hover:text-foreground"
            aria-label={`Remove ${language}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      {isAdding ? (
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAdd();
            if (event.key === "Escape") {
              setIsAdding(false);
              setDraft("");
            }
          }}
          onBlur={handleAdd}
          placeholder="Language"
          className="h-8 min-w-28 rounded-lg border border-propnex-border bg-propnex-bg px-2.5 text-xs text-foreground outline-none focus:border-propnex-accent"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg border border-dashed border-propnex-border px-2.5 py-1.5 text-xs text-propnex-muted transition-colors",
            "hover:border-propnex-accent hover:text-foreground"
          )}
        >
          <Plus className="size-3" />
          Add
        </button>
      )}
    </div>
  );
}
