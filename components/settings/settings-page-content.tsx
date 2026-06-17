"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Bell,
  Building2,
  Key,
  Plug,
  Shield,
  User,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { IntegrationsSection } from "@/components/integrations/integrations-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { OVERFLOW_OPTIONS } from "@/lib/setup-data";
import {
  formatPrimaryUseCase,
  getUserMetadata,
} from "@/lib/user-metadata";
import { cn } from "@/lib/utils";
import { useSetupStore } from "@/stores/setup-store";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "workspace", label: "Workspace", icon: Building2 },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function SettingsPageContent() {
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const { user } = useUser();
  const metadata = getUserMetadata(
    user?.unsafeMetadata as Record<string, unknown> | undefined,
  );
  const channelSettings = useSetupStore((s) => s.channelSettings);
  const updateChannelSettings = useSetupStore((s) => s.updateChannelSettings);

  const displayName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Account";

  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <PageHeader
        title="Settings"
        description="Manage your account, workspace, and integrations."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                activeSection === section.id
                  ? "bg-propnex-accent/10 font-medium text-propnex-accent"
                  : "text-propnex-muted hover:bg-propnex-panel hover:text-foreground",
              )}
            >
              <section.icon className="size-4" />
              {section.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 rounded-xl border border-propnex-border bg-propnex-panel p-6">
          {activeSection === "profile" ? (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Profile</h2>
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarImage src={user?.imageUrl} alt={displayName} />
                  <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{displayName}</p>
                  <p className="text-sm text-propnex-muted">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-propnex-muted">Phone</label>
                  <p className="mt-1 text-sm text-foreground">
                    {metadata.phone ?? "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-propnex-muted">Company</label>
                  <p className="mt-1 text-sm text-foreground">
                    {metadata.companyName ?? "Not set"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "security" ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Security</h2>
              <p className="text-sm text-propnex-muted">
                Manage password, two-factor authentication, and active sessions
                through your Clerk account portal.
              </p>
              <Button variant="outline">Open account security</Button>
            </div>
          ) : null}

          {activeSection === "notifications" ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Notifications
              </h2>
              {["Email alerts", "SMS alerts", "In-app notifications"].map(
                (label) => (
                  <label
                    key={label}
                    className="flex items-center justify-between rounded-lg border border-propnex-border bg-propnex-bg px-4 py-3"
                  >
                    <span className="text-sm text-foreground">{label}</span>
                    <input type="checkbox" defaultChecked className="size-4" />
                  </label>
                ),
              )}
            </div>
          ) : null}

          {activeSection === "integrations" ? (
            <IntegrationsSection />
          ) : null}

          {activeSection === "api-keys" ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">API Keys</h2>
              <div className="rounded-lg border border-propnex-border bg-propnex-bg px-4 py-3 font-mono text-sm text-propnex-muted">
                pn_live_••••••••••••••••
              </div>
              <Button size="sm">Generate new key</Button>
            </div>
          ) : null}

          {activeSection === "workspace" ? (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">
                Workspace Settings
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-propnex-muted">
                    Primary use case
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {formatPrimaryUseCase(metadata.primaryUseCase) || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-propnex-muted">Call volume</label>
                  <p className="mt-1 text-sm text-foreground">
                    {metadata.callVolume ?? "Not set"}
                  </p>
                </div>
              </div>
              <div className="space-y-4 border-t border-propnex-border pt-4">
                <h3 className="text-sm font-medium text-foreground">
                  Call handling
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="max-concurrent"
                      className="text-xs text-propnex-muted"
                    >
                      Max concurrent calls
                    </label>
                    <input
                      id="max-concurrent"
                      type="number"
                      value={channelSettings.maxConcurrentCalls}
                      onChange={(e) =>
                        updateChannelSettings({
                          maxConcurrentCalls: Number(e.target.value),
                        })
                      }
                      className="h-10 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="overflow"
                      className="text-xs text-propnex-muted"
                    >
                      Overflow handling
                    </label>
                    <select
                      id="overflow"
                      value={channelSettings.overflowHandling}
                      onChange={(e) =>
                        updateChannelSettings({
                          overflowHandling: e.target
                            .value as typeof channelSettings.overflowHandling,
                        })
                      }
                      className="h-10 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm"
                    >
                      {OVERFLOW_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
