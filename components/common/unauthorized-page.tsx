"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";

export function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full border border-propnex-border bg-propnex-panel">
        <ShieldX className="size-8 text-propnex-muted" />
      </div>
      <div className="space-y-2">
        <p className="text-5xl font-semibold tracking-tight">403</p>
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="max-w-md text-sm text-propnex-muted">
          You don&apos;t have permission to access this resource.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
        <Button render={<Link href="/dashboard" />}>Return to Dashboard</Button>
      </div>
    </div>
  );
}
