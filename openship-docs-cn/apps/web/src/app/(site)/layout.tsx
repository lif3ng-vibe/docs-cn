import type { Metadata, Viewport } from "next";
import "../globals.css";

const SITE_URL = "https://openship.io";
const SITE_NAME = "Openship";
const TITLE_DEFAULT = "Openship——开源、可自托管的部署平台";
const TITLE_TEMPLATE = "%s - Openship";
const DESCRIPTION =
  "部署一切，拥有一切。可自托管、AI 驱动的部署平台，提供免费 SSL、不限量域名、即时回滚与 CLI/MCP 支持。开源，自托管永久免费。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE_DEFAULT,
    template: TITLE_TEMPLATE,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  category: "technology",
  keywords: [
    "deployment platform",
    "self-hosted",
    "open source",
    "AI deployments",
    "Vercel alternative",
    "Heroku alternative",
    "Netlify alternative",
    "PaaS",
    "free SSL",
    "unlimited domains",
    "CLI deploy",
    "MCP server",
    "instant rollback",
    "git push deploy",
    "docker deploy",
    "self host",
    "VPS deploy",
    "Apache 2.0",
    "open source PaaS",
    "developer tools",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: "Oblien LLC",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE_DEFAULT,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Openship——部署一切，拥有一切。",
    description:
      "开源、可自托管的部署平台，具备 AI 构建与即时回滚。",
    creator: "@openship",
    site: "@openship",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        { url: "/resources/rss.xml", title: "Openship 资源" },
      ],
    },
  },
  // verification: {
  //   google: "<google-site-verification-token>",
  //   yandex: "<yandex-verification-token>",
  //   other: { "msvalidate.01": "<bing-verification-token>" },
  // },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0F0F0F" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F0F" },
  ],
  // Light-only marketing site. The one dark surface (webmail landing) opts in
  // via `color-scheme: dark` on `body:has(.mail-home)` in globals.css, which
  // overrides this document default for that subtree. Declaring "light" here
  // stops the browser from painting a dark canvas/scrollbars under a dark OS.
  colorScheme: "light",
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  legalName: "Oblien LLC",
  url: SITE_URL,
  logo: `${SITE_URL}/android-chrome-512x512.png`,
  description: DESCRIPTION,
  foundingDate: "2024",
  sameAs: [
    "https://github.com/oblien/openship",
    "https://x.com/openshipio",
    "https://discord.gg/Q9eWNCeXjg",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hello@openship.io",
      availableLanguage: ["English"],
    },
  ],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/docs?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  inLanguage: "zh-CN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="preconnect"
          href="https://cdn.oblien.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://cdn.oblien.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
