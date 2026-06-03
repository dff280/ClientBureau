import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteAnalytics } from "@/components/analytics/site-analytics";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSiteUrl } from "@/lib/env";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Client Bureau | Business Client Intelligence",
    template: "%s | Client Bureau",
  },
  description:
    "Client Bureau helps business owners search clients, review moderated reports, and submit documented client experiences before accepting work.",
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
      "Moderated client-risk intelligence before the job starts.",
    url: getSiteUrl(),
    siteName: "Client Bureau",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Client Bureau",
    description:
      "Moderated client-risk intelligence before the job starts.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
