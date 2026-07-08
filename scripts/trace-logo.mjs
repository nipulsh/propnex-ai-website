import fs from "node:fs";
import potrace from "potrace";
import sharp from "sharp";

const input = "./public/logo.png";

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height } = info;
let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Ignore edge compression artifacts; keep only the wordmark body.
    if (y < 200 || y > 520) continue;
    if (r < 200 && g < 200 && b < 200) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

console.log("Wordmark bounds:", { minX, minY, maxX, maxY });

const pad = 4;
const left = Math.max(0, minX - pad);
const top = Math.max(0, minY - pad);
const trimW = Math.min(width - left, maxX - minX + 1 + pad * 2);
const trimH = Math.min(height - top, maxY - minY + 1 + pad * 2);

await sharp(input)
  .extract({ left, top, width: trimW, height: trimH })
  .png()
  .toFile("./public/logo-trimmed.png");

const svg = await new Promise((resolve, reject) => {
  potrace.trace(
    "./public/logo-trimmed.png",
    { threshold: 128, turdSize: 2, optTolerance: 0.2 },
    (err, result) => {
      if (err) reject(err);
      else resolve(result);
    },
  );
});

const pathMatch = svg.match(/<path d="([^"]+)"/);
if (!pathMatch) {
  throw new Error("Could not parse traced SVG path");
}

const cleanedPath = pathMatch[1];
const viewBox = `0 0 ${trimW} ${trimH}`;
const compactWidth = Math.round(trimW * 0.16);
const compactViewBox = `0 0 ${compactWidth} ${trimH}`;

const cleanedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none">
  <path d="${cleanedPath}" fill="currentColor" fill-rule="evenodd"/>
</svg>`;

fs.writeFileSync("./public/logo.svg", cleanedSvg);

const metadata = {
  viewBox,
  compactViewBox,
  trimW,
  trimH,
  compactWidth,
};

fs.writeFileSync(
  "./public/logo-meta.json",
  JSON.stringify(metadata, null, 2),
);

console.log("Wrote public/logo.svg");
console.log(metadata);
