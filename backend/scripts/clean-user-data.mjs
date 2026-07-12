/**
 * Removes all tenant/user data and billing records from MongoDB.
 * Preserves the global AgentLibraryEntry catalog.
 *
 * Usage: npx dotenv -e .env.local -- node scripts/clean-user-data.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function countSnapshot(label) {
  const [users, companies, billingSubs, billingInvoices, creditBalances, creditUsages] =
    await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.billingSubscription.count(),
      prisma.billingInvoice.count(),
      prisma.creditBalance.count(),
      prisma.creditUsage.count(),
    ]);

  console.log(`\n=== ${label} ===`);
  console.log(`User: ${users}`);
  console.log(`Company: ${companies}`);
  console.log(`BillingSubscription: ${billingSubs}`);
  console.log(`BillingInvoice: ${billingInvoices}`);
  console.log(`CreditBalance: ${creditBalances}`);
  console.log(`CreditUsage: ${creditUsages}`);
}

async function main() {
  await countSnapshot("Before cleanup");

  // Billing & credits first (also removed when companies are deleted).
  const billingInvoices = await prisma.billingInvoice.deleteMany();
  const billingSubscriptions = await prisma.billingSubscription.deleteMany();
  const creditUsages = await prisma.creditUsage.deleteMany();
  const creditBalances = await prisma.creditBalance.deleteMany();

  // Tenant data cascades from Company (leads, calls, agents, integrations, etc.).
  const companies = await prisma.company.deleteMany();
  const users = await prisma.user.deleteMany();

  console.log("\n=== Deleted ===");
  console.log(`BillingInvoice: ${billingInvoices.count}`);
  console.log(`BillingSubscription: ${billingSubscriptions.count}`);
  console.log(`CreditUsage: ${creditUsages.count}`);
  console.log(`CreditBalance: ${creditBalances.count}`);
  console.log(`Company: ${companies.count}`);
  console.log(`User: ${users.count}`);

  const libraryEntries = await prisma.agentLibraryEntry.count();
  console.log(`\nAgentLibraryEntry preserved: ${libraryEntries}`);

  await countSnapshot("After cleanup");
}

main()
  .catch((error) => {
    console.error("Cleanup failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
