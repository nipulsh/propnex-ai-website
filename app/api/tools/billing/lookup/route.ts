import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { billingSummary } from "@/lib/billing-data";

export async function POST(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = (await req.json()) as {
    permissions?: { creditAccess?: boolean; planAccess?: boolean; invoiceAccess?: boolean };
  };
  const permissions = body.permissions ?? {
    creditAccess: true,
    planAccess: true,
    invoiceAccess: true,
  };

  const result: Record<string, unknown> = {};

  if (permissions.creditAccess) {
    result.credits = {
      remaining: billingSummary.remainingCredits,
      total: billingSummary.totalCredits,
      used: billingSummary.usedCredits,
    };
  }
  if (permissions.planAccess) {
    result.plan = {
      name: billingSummary.activePlan,
      resetDate: billingSummary.resetDate,
    };
  }
  if (permissions.invoiceAccess) {
    result.invoice = {
      nextAmount: billingSummary.nextInvoiceAmount,
      dueDate: billingSummary.nextInvoiceDue,
      status: "paid",
    };
  }

  return NextResponse.json(result);
}
