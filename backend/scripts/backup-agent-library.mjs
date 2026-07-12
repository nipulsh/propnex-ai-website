import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const entries = await prisma.agentLibraryEntry.findMany();
const outPath = new URL("../backups/agent-library-backup.json", import.meta.url);
writeFileSync(outPath, JSON.stringify(entries, null, 2));
console.log(`Backed up ${entries.length} AgentLibraryEntry records to backups/agent-library-backup.json`);

await prisma.$disconnect();
