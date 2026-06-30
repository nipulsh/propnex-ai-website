import { NextResponse } from "next/server";
import { z } from "zod";

import { getPendingContractCookie } from "@/lib/pending-contract-cookie";
import { checkEmailAvailableForContractSignup } from "@/server/services/signup-email.service";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export async function POST(request: Request) {
  try {
    const contractId = await getPendingContractCookie();
    if (!contractId) {
      return NextResponse.json(
        {
          error:
            "No pending Contract ID found. Please validate your Contract ID again.",
        },
        { status: 400 },
      );
    }

    const body = schema.parse(await request.json());
    const result = await checkEmailAvailableForContractSignup(
      body.email,
      contractId,
    );

    if (!result.available) {
      return NextResponse.json(
        {
          available: false,
          reason: result.reason,
          error: result.message,
          companyName: result.companyName,
        },
        {
          status:
            result.reason === "invalid_contract"
              ? 400
              : 409,
        },
      );
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Signup email check failed:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
