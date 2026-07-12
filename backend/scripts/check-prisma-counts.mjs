import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const counts = [
  ["User", () => prisma.user.count()],
  ["Company", () => prisma.company.count()],
  ["CompanyMember", () => prisma.companyMember.count()],
  ["AiAgent", () => prisma.aiAgent.count()],
  ["PhoneNumber", () => prisma.phoneNumber.count()],
  ["CallLog", () => prisma.callLog.count()],
  ["Lead", () => prisma.lead.count()],
  ["CreditBalance", () => prisma.creditBalance.count()],
  ["Integration", () => prisma.integration.count()],
  ["Campaign", () => prisma.campaign.count()],
  ["AnalyticsSnapshot", () => prisma.analyticsSnapshot.count()],
];

async function main() {
  console.log("=== Document counts (propnex database) ===");
  for (const [name, fn] of counts) {
    console.log(`${name}: ${await fn()}`);
  }
}

main()
  .catch((e) => {
    console.error("FAIL:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
