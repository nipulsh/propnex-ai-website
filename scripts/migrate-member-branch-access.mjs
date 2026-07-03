/**
 * Backfills branchAccessType=ALL for existing CompanyMember rows.
 *
 * Usage: npx dotenv -e .env.local -- node scripts/migrate-member-branch-access.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.companyMember.updateMany({
    where: {},
    data: { branchAccessType: "ALL" },
  });

  console.log(`Updated ${result.count} company member(s) with branchAccessType=ALL`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
