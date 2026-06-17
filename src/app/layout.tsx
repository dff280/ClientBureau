import type { Metadata } from "next";

import { SiteAnalytics } from "@/components/analytics/site-analytics";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSiteUrl } from "@/lib/env";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Client Bureau | Check Clients Before You Take the Job",
    template: "%s | Client Bureau",
  },
  description:
    "Client Bureau helps contractors and service businesses check clients, document jobs, track payment issues, and resolve disputes before risk grows.",
  keywords: [
    "Client Bureau",
    "contractor client reports",
    "client-risk intelligence",
    "business client intelligence",
    "business owner protection",
    "client reporting network",
    "documented contractor experiences",
    "moderated client reports",
    "evidence on file",
    "contractor client search",
  ],
  openGraph: {
    title: "Client Bureau",
    description:
      "Check the client before you take the job.",
    url: getSiteUrl(),
    siteName: "Client Bureau",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Client Bureau contractor business protection platform.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Client Bureau",
    description:
      "Check the client before you take the job.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <AppShell>{children}</AppShell>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
