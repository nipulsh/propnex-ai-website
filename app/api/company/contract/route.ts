import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isAppError } from "@/server/lib/errors";
import { contractService } from "@/server/services/contract.service";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = await contractService.getContractLinkStatus(userId);
    return NextResponse.json(status);
  } catch (err) {
    if (isAppError(err)) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
