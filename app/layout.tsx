import type { Metadata } from "next";

import { TooltipProvider } from "@/components/ui/tooltip";
import { roboto, robotoMono } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "PropNex",
  description: "AI voice agent management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${robotoMono.variable} dark h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
