import fs from "node:fs";

const svg = fs.readFileSync("./public/logo.svg", "utf8");
const pathMatch = svg.match(/d="([^"]+)"/);

if (!pathMatch) {
  throw new Error("Could not extract logo path from SVG");
}

const meta = JSON.parse(fs.readFileSync("./public/logo-meta.json", "utf8"));
const logoPath = pathMatch[1];

const component = `import { cn } from "@/lib/utils";

const LOGO_PATH =
  ${JSON.stringify(logoPath)};

const FULL_VIEWBOX = ${JSON.stringify(meta.viewBox)};
const COMPACT_VIEWBOX = ${JSON.stringify(meta.compactViewBox)};

type PropnexLogoProps = {
  className?: string;
  variant?: "full" | "compact";
};

export function PropnexLogo({
  className,
  variant = "full",
}: PropnexLogoProps) {
  return (
    <svg
      role="img"
      aria-label="Propnex ai"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={variant === "compact" ? COMPACT_VIEWBOX : FULL_VIEWBOX}
      fill="none"
      className={cn("shrink-0", className)}
    >
      <path d={LOGO_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
`;

fs.writeFileSync("./components/common/propnex-logo.tsx", component);
console.log("Created components/common/propnex-logo.tsx");
