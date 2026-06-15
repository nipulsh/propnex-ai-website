"use client";

import { PhoneCall, PlugZap } from "lucide-react";

import { SetupBanner } from "@/components/setup/setup-banner";
import { SetupSection } from "@/components/setup/setup-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSetupStore } from "@/stores/setup-store";

export function TestEnvironment() {
  const testEnvironment = useSetupStore((state) => state.testEnvironment);
  const setTestPhoneNumber = useSetupStore((state) => state.setTestPhoneNumber);
  const runTestCall = useSetupStore((state) => state.runTestCall);
  const runTestConnection = useSetupStore((state) => state.runTestConnection);

  const { phoneNumber, result, isTesting } = testEnvironment;

  return (
    <SetupSection
      title="Test Environment"
      description="Validate connectivity and place test calls before going live."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <div className="space-y-2">
          <label
            htmlFor="test-phone-number"
            className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
          >
            Test Phone Number
          </label>
          <Input
            id="test-phone-number"
            type="tel"
            value={phoneNumber}
            onChange={(event) => setTestPhoneNumber(event.target.value)}
            placeholder="+15550123456"
            className="h-11 border-propnex-border bg-propnex-bg text-foreground placeholder:text-propnex-muted"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => void runTestCall()}
            disabled={isTesting}
            className="h-11 gap-2 px-4"
          >
            <PhoneCall className="size-4" />
            {isTesting ? "Running…" : "Test Call"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void runTestConnection()}
            disabled={isTesting}
            className="h-11 gap-2 border-propnex-border bg-propnex-bg px-4"
          >
            <PlugZap className="size-4" />
            {isTesting ? "Running…" : "Test Connection"}
          </Button>
        </div>

        {result ? (
          <div className="mt-5 space-y-3">
            <SetupBanner
              type={result.status === "success" ? "success" : "error"}
              message={result.message}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-propnex-border bg-propnex-bg/50 px-4 py-3">
                <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                  Test Result
                </p>
                <p className="mt-1 text-sm font-medium capitalize text-foreground">
                  {result.status}
                </p>
              </div>
              <div className="rounded-lg border border-propnex-border bg-propnex-bg/50 px-4 py-3">
                <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                  Response Time
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {result.responseTimeMs > 0
                    ? `${result.responseTimeMs} ms`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-propnex-muted">
            Run a test to see results, response time, and any error messages.
          </p>
        )}
      </div>
    </SetupSection>
  );
}
