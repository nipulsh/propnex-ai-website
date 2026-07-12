import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const count = await prisma.agentLibraryEntry.count();
console.log(`AgentLibraryEntry: ${count}`);

await prisma.$disconnect();
