import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const files = [
  "app/api/integrations/google/connect/route.ts",
  "app/api/integrations/google/oauth/start/route.ts",
  "app/api/integrations/google/oauth/callback/route.ts",
  "app/api/integrations/google/sheets/spreadsheets/route.ts",
  "app/api/integrations/google/sheets/spreadsheets/create/route.ts",
  "app/api/integrations/google/sheets/worksheets/route.ts",
  "app/api/integrations/google/sheets/headers/route.ts",
  "app/api/integrations/google/sheets/config/route.ts",
  "app/api/integrations/google/sheets/sync/route.ts",
  "app/api/integrations/google/sheets/sync-history/route.ts",
  "app/api/integrations/google/calendar/calendars/route.ts",
  "app/api/integrations/google/calendar/config/route.ts",
  "app/api/tools/google-sheets/execute/route.ts",
  "app/api/tools/google-calendar/availability/route.ts",
  "app/api/tools/google-calendar/events/route.ts",
  "app/api/contact-phones/parse-upload/route.ts",
];

function patchFile(relPath) {
  const filePath = path.join(root, relPath);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, "utf8");
  if (!content.includes("requireTenantContext")) return;

  const usesAgents =
    relPath.includes("tools/google") || relPath.includes("contact-phones");
  const readFn = usesAgents ? "requireAgentsRead" : "requireIntegrationsRead";
  const writeFn = usesAgents ? "requireAgentsWrite" : "requireIntegrationsWrite";

  content = content.replace(
    /import \{ requireTenantContext \} from "@\/lib\/api\/tenant-context";/,
    `import {\n  ${readFn},\n  ${writeFn},\n} from "@/lib/integrations/api-guard";`,
  );

  content = content.replace(
    /const \{ error, ctx \} = await requireTenantContext\(\);\s*if \(error \|\| !ctx\) return error!;/g,
    (match, offset) => {
      const before = content.slice(0, offset);
      const handlerMatch = before.match(/export async function (\w+)/g);
      const handler =
        handlerMatch?.[handlerMatch.length - 1]?.replace(
          "export async function ",
          "",
        ) ?? "GET";
      const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(handler);
      const fn = isWrite ? writeFn : readFn;
      return `const { error, ctx } = await ${fn}();\n  if (error || !ctx) return error!;`;
    },
  );

  fs.writeFileSync(filePath, content);
  console.log("patched", relPath);
}

for (const file of files) {
  patchFile(file);
}
