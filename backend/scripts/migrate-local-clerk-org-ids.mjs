/**
 * Backfills Company.clerkOrganizationId for legacy rows stored as null.
 * Assigns `local:{ownerClerkUserId}` so the unique index is satisfied per tenant.
 *
 * Usage: npx dotenv -e .env.local -- node scripts/migrate-local-clerk-org-ids.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function localClerkOrganizationId(clerkUserId) {
  return `local:${clerkUserId}`;
}

async function main() {
  const orphans = await prisma.company.findMany({
    where: { clerkOrganizationId: null },
    include: {
      members: {
        where: { role: "OWNER", status: "ACTIVE" },
        include: { user: true },
        take: 1,
      },
    },
  });

  console.log(`Found ${orphans.length} company row(s) with null clerkOrganizationId`);

  let updated = 0;
  for (const company of orphans) {
    const owner = company.members[0]?.user;
    if (!owner?.clerkUserId) {
      console.warn(`Skipping company ${company.id} — no active OWNER with clerkUserId`);
      continue;
    }

    const clerkOrganizationId = localClerkOrganizationId(owner.clerkUserId);
    const conflict = await prisma.company.findUnique({
      where: { clerkOrganizationId },
    });
    if (conflict && conflict.id !== company.id) {
      console.warn(
        `Skipping company ${company.id} — ${clerkOrganizationId} already used by ${conflict.id}`,
      );
      continue;
    }

    await prisma.company.update({
      where: { id: company.id },
      data: { clerkOrganizationId },
    });
    updated += 1;
    console.log(`Updated company ${company.id} -> ${clerkOrganizationId}`);
  }

  console.log(`\nDone. Updated ${updated} company row(s).`);
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
