"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Calendar,
  CreditCard,
  HelpCircle,
  Plug,
  Sheet,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { AgentToolCatalogCard } from "@/components/tools/agent-tool-catalog-card";
import { ConfigureToolAgentDialog } from "@/components/tools/configure-tool-agent-dialog";
import { Button } from "@/components/ui/button";
import { useAgentsGraphQL } from "@/hooks/use-agents-graphql";
import { INTEGRATION_DEFINITIONS } from "@/lib/integrations/registry";
import { TOOL_REGISTRY } from "@/lib/tools/registry";
import type { ToolRegistryEntry } from "@/lib/tools/registry";

export function ToolsPageContent() {
  useAgentsGraphQL();
  const [configureTool, setConfigureTool] = useState<ToolRegistryEntry | null>(
    null,
  );
  const [configureOpen, setConfigureOpen] = useState(false);
  const availableIntegrations = INTEGRATION_DEFINITIONS.filter((d) => d.available);
  const comingSoonIntegrations = INTEGRATION_DEFINITIONS.filter(
    (d) => d.comingSoon,
  );

  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto overscroll-contain p-6 pb-6">
      <PageHeader
        title="Tools"
        description="Discover workspace integrations and per-agent capabilities for live conversations."
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Workspace Integrations
            </h2>
            <p className="mt-1 text-sm text-propnex-muted">
              Connect external services once at the workspace level. Manage
              connections in Settings.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/settings?tab=integrations" />}
          >
            <Plug className="mr-1.5 size-4" />
            Manage integrations
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {availableIntegrations.map((item) => (
            <article
              key={item.id}
              className="flex flex-col rounded-xl border border-propnex-border bg-propnex-panel p-5"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-propnex-accent/15 text-propnex-accent">
                <item.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {item.name}
              </h3>
              <p className="mt-2 flex-1 text-sm text-propnex-muted">
                {item.description}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-fit"
                nativeButton={false}
                render={<Link href="/settings?tab=integrations" />}
              >
                Configure in Settings
              </Button>
            </article>
          ))}
          {comingSoonIntegrations.map((item) => (
            <article
              key={item.id}
              className="flex flex-col rounded-xl border border-propnex-border bg-propnex-panel p-5 opacity-60"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-propnex-muted/15 text-propnex-muted">
                <item.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {item.name}
                <span className="ml-2 text-xs font-normal text-propnex-muted">
                  Coming soon
                </span>
              </h3>
              <p className="mt-2 text-sm text-propnex-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Agent Tools
            </h2>
            <p className="mt-1 text-sm text-propnex-muted">
              Enable capabilities per agent. Each agent can have different tool
              access and permissions.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/agents" />}
          >
            <Bot className="mr-1.5 size-4" />
            Go to Agents
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {TOOL_REGISTRY.map((tool) => (
            <AgentToolCatalogCard
              key={tool.id}
              tool={tool}
              onConfigure={() => {
                setConfigureTool(tool);
                setConfigureOpen(true);
              }}
            />
          ))}
        </div>

        <ConfigureToolAgentDialog
          open={configureOpen}
          onOpenChange={setConfigureOpen}
          tool={configureTool}
        />

        <div className="flex flex-wrap gap-3 rounded-xl border border-propnex-border bg-propnex-bg px-4 py-3 text-xs text-propnex-muted">
          <span className="flex items-center gap-1">
            <HelpCircle className="size-3.5" /> FAQ Tool
          </span>
          <span className="flex items-center gap-1">
            <CreditCard className="size-3.5" /> Billing Tool
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" /> Google Calendar Tool
          </span>
          <span className="flex items-center gap-1">
            <Sheet className="size-3.5" /> Google Sheets Tool
          </span>
        </div>
      </section>
    </div>
  );
}
