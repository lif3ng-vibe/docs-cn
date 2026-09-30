import type { Metadata } from "next";
import { Navbar } from "@/components/landing";
import HomeContent from "./_components/home/HomeContent";

const TITLE = "邮件——内置的事务性与团队邮箱";
const DESCRIPTION =
  "在自己的域名上收发邮件，无需第三方 SMTP 服务商。内置于 Openship——域名不限量、邮箱不限量，Apache 2.0 开源。";

export const metadata: Metadata = {
  title: "邮件",
  description: DESCRIPTION,
  alternates: { canonical: "/mail" },
  keywords: [
    "self-hosted email",
    "transactional email",
    "open source SMTP",
    "team email",
    "unlimited mailboxes",
    "custom domain email",
    "self host mail server",
    "Mailgun alternative",
    "SendGrid alternative",
    "Postmark alternative",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/mail",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const serviceLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Openship Mail",
  serviceType: "Email Hosting",
  provider: {
    "@type": "Organization",
    name: "Openship",
    url: "https://openship.io",
  },
  description: DESCRIPTION,
  url: "https://openship.io/mail",
  areaServed: "Worldwide",
  audience: {
    "@type": "Audience",
    audienceType: "Developers, SaaS teams, agencies",
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://openship.io" },
    { "@type": "ListItem", position: 2, name: "Mail", item: "https://openship.io/mail" },
  ],
};

export default function MailLandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Navbar />
      <HomeContent />
    </>
  );
}
