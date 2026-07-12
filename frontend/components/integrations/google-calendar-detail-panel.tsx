"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  DayOfWeek,
  WorkspaceIntegration,
} from "@/lib/integrations/types";
import { useIntegrationsStore } from "@/stores/integrations-store";

const DAYS: { id: DayOfWeek; label: string }[] = [
  { id: "monday", label: "Mon" },
  { id: "tuesday", label: "Tue" },
  { id: "wednesday", label: "Wed" },
  { id: "thursday", label: "Thu" },
  { id: "friday", label: "Fri" },
  { id: "saturday", label: "Sat" },
  { id: "sunday", label: "Sun" },
];

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Singapore",
  "Australia/Sydney",
];

type GoogleCalendarDetailPanelProps = {
  integration: WorkspaceIntegration;
};

export function GoogleCalendarDetailPanel({
  integration,
}: GoogleCalendarDetailPanelProps) {
  const config = integration.calendarConfig!;
  const calendars = useIntegrationsStore((s) => s.calendars);
  const isSaving = useIntegrationsStore((s) => s.isSaving);
  const fetchCalendars = useIntegrationsStore((s) => s.fetchCalendars);
  const saveCalendarConfig = useIntegrationsStore((s) => s.saveCalendarConfig);

  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  async function handleCalendarChange(calendarId: string) {
    const cal = calendars.find((c) => c.id === calendarId);
    await saveCalendarConfig({
      calendarId,
      calendarName: cal?.name ?? null,
      timezone: cal?.timezone ?? config.timezone,
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-propnex-border bg-propnex-bg px-4 py-3 text-sm">
        <span className="text-propnex-muted">Connected account: </span>
        <span className="font-medium text-foreground">
          {integration.connectedAccount}
        </span>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Calendar</h4>
        <select
          value={config.calendarId ?? ""}
          onChange={(e) => handleCalendarChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm"
        >
          <option value="">Select a calendar</option>
          {calendars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.primary ? "(Primary)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Timezone</h4>
        <select
          value={config.timezone}
          onChange={(e) => saveCalendarConfig({ timezone: e.target.value })}
          className="h-10 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs text-propnex-muted">Meeting duration (min)</label>
          <input
            type="number"
            min={15}
            step={15}
            value={config.meetingDurationMinutes}
            onChange={(e) =>
              saveCalendarConfig({
                meetingDurationMinutes: Number(e.target.value),
              })
            }
            className="h-10 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-propnex-muted">Buffer time (min)</label>
          <input
            type="number"
            min={0}
            step={5}
            value={config.bufferMinutes}
            onChange={(e) =>
              saveCalendarConfig({ bufferMinutes: Number(e.target.value) })
            }
            className="h-10 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Working Hours</h4>
        <div className="space-y-2">
          {DAYS.map(({ id, label }) => {
            const day = config.workingHours[id];
            return (
              <div
                key={id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2"
              >
                <label className="flex w-12 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) =>
                      saveCalendarConfig({
                        workingHours: {
                          ...config.workingHours,
                          [id]: { ...day, enabled: e.target.checked },
                        },
                      })
                    }
                    className="size-4"
                  />
                  {label}
                </label>
                {day.enabled ? (
                  <>
                    <input
                      type="time"
                      value={day.start}
                      onChange={(e) =>
                        saveCalendarConfig({
                          workingHours: {
                            ...config.workingHours,
                            [id]: { ...day, start: e.target.value },
                          },
                        })
                      }
                      className="h-8 rounded-md border border-propnex-border bg-propnex-panel px-2 text-xs"
                    />
                    <span className="text-propnex-muted">to</span>
                    <input
                      type="time"
                      value={day.end}
                      onChange={(e) =>
                        saveCalendarConfig({
                          workingHours: {
                            ...config.workingHours,
                            [id]: { ...day, end: e.target.value },
                          },
                        })
                      }
                      className="h-8 rounded-md border border-propnex-border bg-propnex-panel px-2 text-xs"
                    />
                  </>
                ) : (
                  <span className="text-xs text-propnex-muted">Unavailable</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isSaving ? (
        <p className="flex items-center gap-2 text-xs text-propnex-muted">
          <Loader2 className="size-3 animate-spin" />
          Saving...
        </p>
      ) : null}
    </div>
  );
}
