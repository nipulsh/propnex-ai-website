#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const INSTRUCTIONS_FILE = path.join(process.cwd(), ".cursor", "SESSION_INSTRUCTIONS.md");
const MARKER = "<!-- instructions-start -->";

function readInstructions() {
  if (!fs.existsSync(INSTRUCTIONS_FILE)) {
    return "";
  }

  const content = fs.readFileSync(INSTRUCTIONS_FILE, "utf8");
  const markerIndex = content.indexOf(MARKER);

  if (markerIndex === -1) {
    return content.trim();
  }

  return content.slice(markerIndex + MARKER.length).trim();
}

function drainStdin() {
  return new Promise((resolve) => {
    let input = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      input += chunk;
    });
    process.stdin.on("end", () => resolve(input));
    process.stdin.resume();
  });
}

async function main() {
  await drainStdin();

  const instructions = readInstructions();
  if (!instructions) {
    process.stdout.write("{}");
    return;
  }

  process.stdout.write(
    JSON.stringify({
      additional_context: [
        "# Project session instructions",
        "",
        "The following instructions were loaded at session start. Follow them for this entire conversation unless the user overrides them:",
        "",
        instructions,
      ].join("\n"),
    }),
  );
}

main().catch(() => {
  process.stdout.write("{}");
});
