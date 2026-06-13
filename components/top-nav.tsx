import { BookOpen, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border px-6">
      <Button variant="ghost" size="sm" className="text-muted-foreground">
        <BookOpen />
        Documentation
      </Button>

      <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
        <span className="size-2 rounded-full bg-success" />
        API Status
      </div>

      <Button size="sm">
        <Sparkles />
        Assistant
      </Button>
    </header>
  );
}
