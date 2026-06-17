"use client";

import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "resources", label: "Resources" },
  { id: "configuration", label: "Configuration" },
  { id: "tools", label: "Agent Tools" },
  { id: "intelligence", label: "Analysis" },
  { id: "calls", label: "Call Activity" },
  { id: "knowledge", label: "Knowledge" },
] as const;

type AgentSectionNavProps = {
  activeSection?: string;
};

export function AgentSectionNav({ activeSection }: AgentSectionNavProps) {
  return (
    <nav
      className="sticky top-0 z-10 -mx-6 border-b border-propnex-border bg-propnex-bg/95 px-6 py-3 backdrop-blur-sm"
      aria-label="Agent sections"
    >
      <div className="propnex-scrollbar flex gap-1 overflow-x-auto">
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeSection === section.id
                ? "bg-propnex-accent/15 text-propnex-accent"
                : "text-propnex-muted hover:bg-propnex-panel hover:text-foreground",
            )}
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
