import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isAppError } from "@/server/lib/errors";
import { contractService } from "@/server/services/contract.service";

const schema = z.object({
  contractId: z.string().min(1, "Contract ID is required"),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = schema.parse(await request.json());
    const result = await contractService.linkContractId(userId, body.contractId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? err.message },
        { status: 400 },
      );
    }
    if (isAppError(err)) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error("POST /api/company/contract/link failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
