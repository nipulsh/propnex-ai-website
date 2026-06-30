/**
 * Backfills Company.contractId, ownerUserId, and claimedAt for existing rows.
 *
 * Usage: npx dotenv -e .env.local -- node scripts/migrate-contract-ids.mjs
 */
import { PrismaClient } from "@prisma/client";
import randomstring from "randomstring";

const prisma = new PrismaClient();

function generateContractId() {
  return randomstring.generate({
    length: 10,
    charset: "alphanumeric",
    capitalization: "uppercase",
  });
}

async function generateUniqueContractId() {
  for (let attempt = 0; attempt < 20; attempt++) {
    const contractId = generateContractId();
    const existing = await prisma.company.findFirst({
      where: { contractId },
      select: { id: true },
    });
    if (!existing) {
      return contractId;
    }
  }
  throw new Error("Failed to generate unique contract ID after 20 attempts");
}

async function main() {
  const companies = await prisma.company.findMany({
    include: {
      members: {
        where: { role: "OWNER", status: "ACTIVE" },
        include: { user: true },
        take: 1,
      },
    },
  });

  console.log(`Found ${companies.length} company row(s)`);

  let updated = 0;
  for (const company of companies) {
    const owner = company.members[0]?.user;
    const needsContractId = !company.contractId;
    const needsOwner = !company.ownerUserId && owner?.clerkUserId;

    if (!needsContractId && !needsOwner) {
      continue;
    }

    const contractId = company.contractId ?? (await generateUniqueContractId());
    const ownerUserId = company.ownerUserId ?? owner?.clerkUserId ?? null;
    const claimedAt =
      company.claimedAt ??
      (ownerUserId ? (owner?.joinedAt ?? company.createdAt) : null);

    await prisma.company.update({
      where: { id: company.id },
      data: {
        contractId,
        ownerUserId,
        claimedAt,
      },
    });

    console.log(
      `Updated company ${company.id} (${company.name}) → contractId=${contractId}, ownerUserId=${ownerUserId ?? "—"}`,
    );
    updated++;
  }

  console.log(`Done. Updated ${updated} company row(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
