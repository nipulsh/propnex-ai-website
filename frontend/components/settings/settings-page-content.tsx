"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Bell,
  Building2,
  Plug,
  Shield,
  User,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { IntegrationsSection } from "@/components/integrations/integrations-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  formatCallVolumeRange,
  formatPrimaryUseCase,
  getUserMetadata,
} from "@/lib/user-metadata";
import { cn } from "@/lib/utils";
import { useSettingsGraphQL } from "@/hooks/use-settings-graphql";
import { useSettingsStore } from "@/stores/settings-store";
import { PointOfContactSection } from "@/components/settings/point-of-contact-section";
import { ContractIdSection } from "@/components/settings/contract-id-section";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "workspace", label: "Workspace", icon: Building2 },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const SECTION_IDS = new Set<string>(SECTIONS.map((s) => s.id));

function parseSectionId(value: string | null): SectionId {
  if (value && SECTION_IDS.has(value)) {
    return value as SectionId;
  }
  return "profile";
}

export function SettingsPageContent() {
  useSettingsGraphQL();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<SectionId>(() =>
    parseSectionId(searchParams.get("tab")),
  );
  const { user } = useUser();
  const viewer = useSettingsStore((s) => s.viewer);
  const metadata = getUserMetadata(
    user?.unsafeMetadata as Record<string, unknown> | undefined,
  );

  const displayName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Account";

  useEffect(() => {
    const tab = searchParams.get("tab");
    const next = parseSectionId(tab);
    setActiveSection(next);
  }, [searchParams]);

  function handleSectionChange(sectionId: SectionId) {
    setActiveSection(sectionId);
    const params = new URLSearchParams(searchParams.toString());
    if (sectionId === "profile") {
      params.delete("tab");
    } else {
      params.set("tab", sectionId);
    }
    const query = params.toString();
    router.replace(query ? `/settings?${query}` : "/settings", { scroll: false });
  }

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
              onClick={() => handleSectionChange(section.id)}
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
                    {viewer?.company.name ?? metadata.companyName ?? "Not set"}
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

          {activeSection === "workspace" ? (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">
                Workspace Settings
              </h2>
              {viewer ? (
                <div className="rounded-lg border border-propnex-border bg-propnex-bg/50 px-4 py-3 text-sm">
                  <p className="font-medium text-foreground">{viewer.company.name}</p>
                  <p className="text-propnex-muted">
                    Role: {viewer.role} · {viewer.email}
                  </p>
                </div>
              ) : null}
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
                    {formatCallVolumeRange(metadata.callVolume) || "Not set"}
                  </p>
                </div>
              </div>
              <ContractIdSection />
              {viewer ? <PointOfContactSection /> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
