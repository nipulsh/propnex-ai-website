import { NextResponse } from "next/server";
import { z } from "zod";

import { requireTenantContext, requireTenantPermission } from "@/lib/api/tenant-context";
import { PERMISSIONS } from "@/lib/permissions";
import { isAppError } from "@/server/lib/errors";
import { companyService } from "@/server/services/company.service";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  title: z.string().optional(),
});

export async function GET() {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  try {
    const contact = await companyService.getContact(ctx);
    return NextResponse.json({ contact });
  } catch (err) {
    if (isAppError(err)) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { error, ctx } = await requireTenantPermission(PERMISSIONS.SETTINGS_WRITE);
  if (error || !ctx) return error!;

  try {
    const body = schema.parse(await request.json());
    const contact = await companyService.upsertContact(ctx, {
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() || undefined,
      title: body.title?.trim() || undefined,
    });
    return NextResponse.json({ contact });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? err.message }, { status: 400 });
    }
    if (isAppError(err)) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
