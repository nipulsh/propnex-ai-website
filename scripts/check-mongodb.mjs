import { MongoClient } from "mongodb";
import { PrismaClient } from "@prisma/client";

const uri = process.env.DATABASE_URL;
if (!uri) {
  console.error("FAIL: DATABASE_URL not set");
  process.exit(1);
}

const redacted = uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@").split("?")[0];
const prisma = new PrismaClient();

async function main() {
  console.log("=== MongoDB connectivity check ===");
  console.log("Target:", redacted);

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const ping = await client.db().admin().ping();
    console.log("Native driver ping:", ping.ok === 1 ? "OK" : "FAIL");

    const db = client.db("propnex");
    const collections = await db.listCollections().toArray();
    console.log("Database: propnex");
    console.log("Collections:", collections.length);

    for (const name of [
      "User",
      "Company",
      "CompanyMember",
      "AiAgent",
      "CallLog",
      "Lead",
    ]) {
      const exists = collections.some((c) => c.name === name);
      if (exists) {
        const count = await db.collection(name).countDocuments();
        console.log(`  - ${name}: ${count} documents`);
      }
    }
  } finally {
    await client.close();
  }

  const userCount = await prisma.user.count();
  const companyCount = await prisma.company.count();
  const memberCount = await prisma.companyMember.count();
  console.log("Prisma query: OK");
  console.log(`  - Users: ${userCount}`);
  console.log(`  - Companies: ${companyCount}`);
  console.log(`  - CompanyMembers: ${memberCount}`);
  console.log("=== All checks passed ===");
}

main()
  .catch((e) => {
    console.error("FAIL:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
