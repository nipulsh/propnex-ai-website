import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isAppError } from "@/server/lib/errors";
import prisma from "@/server/lib/prisma";
import { TenantRepository } from "@/server/repositories/tenant.repository";
import { reconcileInviteMembershipOnLogin } from "@/server/services/clerk-provision.service";
import { contractService } from "@/server/services/contract.service";

const tenantRepo = new TenantRepository(prisma);

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await tenantRepo.findUserByClerkId(userId);
    if (dbUser) {
      const invitedMembership = await prisma.companyMember.findFirst({
        where: { userId: dbUser.id, status: "INVITED" },
      });
      if (invitedMembership) {
        await reconcileInviteMembershipOnLogin(userId, orgId);
      }
    }

    const status = await contractService.getContractLinkStatus(userId);
    return NextResponse.json(status);
  } catch (err) {
    if (isAppError(err)) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
