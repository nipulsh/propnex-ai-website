import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  console.log("=== Prisma MongoDB check ===");
  const [users, companies, members] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.companyMember.count(),
  ]);
  console.log("Connection: OK");
  console.log("Users:", users);
  console.log("Companies:", companies);
  console.log("CompanyMembers:", members);
}

main()
  .catch((e) => {
    console.error("FAIL:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
