import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import {
  createSpreadsheet,
  getSpreadsheets,
} from "@/lib/api/integration-state";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  return NextResponse.json({ spreadsheets: getSpreadsheets() });
}

export async function POST(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = (await req.json()) as { name?: string };
  const name =
    body.name?.trim() ||
    `PropNex Sheet ${new Date().toLocaleDateString()}`;
  const spreadsheet = createSpreadsheet(name);

  return NextResponse.json({ spreadsheet });
}
