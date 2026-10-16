import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { CustomCursor } from "@/components/background/CustomCursor";

import { LoadingWrapper } from "@/components/layout/LoadingWrapper";

export const metadata: Metadata = {
  title: "DIU NEST | Procurement Intelligence",
  description:
    "Evidence-first procurement intelligence. Turn requirements into live, verifiable buying decisions.",
  keywords: ["procurement", "intelligence", "supply chain", "enterprise", "evidence"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className="font-sans antialiased bg-[#FBFBF8] text-[#181922] overflow-x-hidden"
        style={{
          "--font-display": "Sora, Inter, ui-sans-serif, system-ui, sans-serif",
          "--font-sans": "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          "--font-mono": "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
        } as CSSProperties}
      >
        {/* Custom cursor (desktop only) */}
        <CustomCursor />
        {/* Micro grain overlay — very subtle texture */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-[9998] opacity-[0.012]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "256px 256px",
          }}
        />
        {/* Page content wrapped in loader */}
        <div className="relative z-10">
          <LoadingWrapper>{children}</LoadingWrapper>
        </div>
      </body>
    </html>
  );
}
