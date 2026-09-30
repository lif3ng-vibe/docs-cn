import {
  Navbar,
  Hero,
  Dashboard,
  SystemMap,
  HowItWorks,
  DeploymentModels,
  CompletePlatform,
  MailServer,
  Comparison,
  OpenSource,
  FinalCta,
  Footer,
} from "@/components/landing";

const SITE_URL = "https://openship.io";

const softwareLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Openship",
  applicationCategory: "DeveloperApplication",
  applicationSubCategory: "Deployment Platform",
  operatingSystem: "macOS, Windows, Linux, Web",
  url: SITE_URL,
  downloadUrl: `${SITE_URL}/download`,
  softwareVersion: "latest",
  publisher: {
    "@type": "Organization",
    name: "Openship",
    url: SITE_URL,
  },
  description:
    "开源、可自托管的部署平台：AI 加持的构建、免费 SSL、即时回滚、域名不限，支持 CLI/MCP。",
  license: "https://www.apache.org/licenses/LICENSE-2.0",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "AI 加持的构建",
    "免费 SSL 证书",
    "域名数量不限",
    "即时回滚",
    "CLI 部署",
    "MCP 服务器集成",
    "可自托管",
    "多区域边缘网络",
    "托管 Postgres / Redis / 邮件",
    "零停机部署",
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <Dashboard />
        <SystemMap />
        <HowItWorks />
        <DeploymentModels />
        <CompletePlatform />
        <MailServer />
        <Comparison />
        <OpenSource />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
