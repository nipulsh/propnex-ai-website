import { NextResponse } from "next/server";
import { z } from "zod";

import { setPendingContractCookie } from "@/lib/pending-contract-cookie";
import { normalizeContractId } from "@/server/lib/contract-id";
import prisma from "@/server/lib/prisma";

const schema = z.object({
  contractId: z.string().min(1, "Contract ID is required"),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const contractId = normalizeContractId(body.contractId);

    if (!contractId) {
      return NextResponse.json(
        { error: "Invalid Contract ID. Enter a 10-character code." },
        { status: 400 },
      );
    }

    const company = await prisma.company.findUnique({
      where: { contractId },
      select: {
        id: true,
        name: true,
        ownerUserId: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Invalid Contract ID." },
        { status: 400 },
      );
    }

    if (company.ownerUserId != null) {
      return NextResponse.json(
        { error: "This Contract ID has already been claimed." },
        { status: 409 },
      );
    }

    await setPendingContractCookie(contractId);

    return NextResponse.json({
      valid: true,
      companyName: company.name,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Contract ID validation failed:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
