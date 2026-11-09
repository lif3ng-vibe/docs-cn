import type { Metadata, Viewport } from "next";
import { GeistdocsThemeScript } from "@vercel/geistdocs/layout";
import { Navbar } from "@vercel/geistdocs/navbar";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import { DocsProvider } from "@/components/geistdocs-provider";
import { SiteFooter } from "@/components/site-footer";
import { config } from "@/lib/geistdocs/config";
import { siteDescription, siteName, siteUrl, upstreamUrl } from "@/lib/site";
import "./globals.css";

export const viewport: Viewport = { viewportFit: "cover" };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | AI 浏览器自动化 CLI`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName: "agent-browser",
    title: `${siteName} | AI 浏览器自动化 CLI`,
    description: siteDescription,
    images: [
      {
        url: `${upstreamUrl}/og`,
        width: 1200,
        height: 630,
        alt: "agent-browser",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | AI 浏览器自动化 CLI`,
    description: siteDescription,
    images: [`${upstreamUrl}/og`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable} antialiased`}
    >
      <head>
        <GeistdocsThemeScript />
      </head>
      <body>
        <DocsProvider>
          <Navbar config={config} />
          {children}
          <SiteFooter />
        </DocsProvider>
      </body>
    </html>
  );
}
