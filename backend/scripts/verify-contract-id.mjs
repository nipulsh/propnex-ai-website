import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CONTRACT_ID_PATTERN = /^[A-Z0-9]{10}$/;

async function main() {
  const unclaimed = await prisma.company.findFirst({
    where: { ownerUserId: null },
    select: { contractId: true, name: true, ownerUserId: true },
  });
  const claimed = await prisma.company.findFirst({
    where: { ownerUserId: { not: null } },
    select: { contractId: true, ownerUserId: true, claimedAt: true },
  });
  const recent = await prisma.company.findFirst({
    orderBy: { createdAt: "desc" },
    select: {
      contractId: true,
      name: true,
      ownerUserId: true,
      claimedAt: true,
    },
  });

  console.log("Schema checks:");
  console.log("- unclaimed company exists:", Boolean(unclaimed));
  console.log("- claimed company exists:", Boolean(claimed));
  console.log(
    "- contract ID format valid:",
    [unclaimed, claimed, recent]
      .filter(Boolean)
      .every((row) => CONTRACT_ID_PATTERN.test(row.contractId)),
  );
  console.log("\nSample unclaimed:", unclaimed);
  console.log("Sample claimed:", claimed);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
