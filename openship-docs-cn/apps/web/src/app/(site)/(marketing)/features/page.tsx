import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar, Footer } from "@/components/landing";
import { FEATURES, CATEGORY_ORDER, CATEGORY_BLURB } from "./_data";
import "../roadmap/roadmap.css";
import "./features.css";

const PAGE_TITLE = "功能";
const PAGE_DESCRIPTION =
  "介于你的代码与生产环境之间的一切——推送即部署、任意技术栈、即时回滚、实时日志、托管数据库、域名与 SSL、私有网络、邮件、控制台/CLI/桌面应用，以及面向 AI 代理的 MCP 服务器。自托管或云端皆可。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/features" },
  openGraph: { title: `${PAGE_TITLE} — Openship`, description: PAGE_DESCRIPTION, url: "/features", type: "website" },
  twitter: { card: "summary_large_image", title: `${PAGE_TITLE} — Openship`, description: PAGE_DESCRIPTION },
};

export default function FeaturesPage() {
  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="rm-hero hero-section relative flex min-h-[60dvh] flex-col items-center justify-center overflow-hidden">
        <div className="hero-grain absolute inset-0" aria-hidden="true" />
        <div className="hero-grid absolute inset-0" aria-hidden="true" />
        <div className="hero-aurora" aria-hidden="true">
          <div className="hero-aurora-core" />
          <div className="hero-aurora-wing hero-aurora-wing--left" />
          <div className="hero-aurora-wing hero-aurora-wing--right" />
        </div>

        <div className="relative z-20 mx-auto w-full max-w-[820px] px-6 text-center">
          <p className="animate-fade-in-up text-[12px] font-semibold uppercase tracking-[0.16em] th-text-muted">
            功能
          </p>
          <h1 className="animate-fade-in-up animate-delay-100 mt-5">
            <span className="block text-[clamp(2.4rem,5.2vw,4rem)] font-medium leading-[1.08] tracking-[-0.02em] th-text-heading">
              介于你的代码
            </span>
            <span className="hero-headline-second block text-[clamp(2.4rem,5.2vw,4rem)] font-light italic leading-[1.08] tracking-[-0.015em]">
              与生产环境之间的一切。
            </span>
          </h1>
          <p className="animate-fade-in-up animate-delay-200 mx-auto mt-6 max-w-[560px] text-[16px] leading-[1.65] th-text-body">
            构建、证书、路由、数据库都交给我们——你只管写应用。
            逐项浏览平台功能。
          </p>
        </div>

        <div className="hero-edge-fade-top absolute top-0 left-0 right-0 h-20" aria-hidden="true" />
        <div className="hero-edge-fade-bottom absolute bottom-0 left-0 right-0 h-40" aria-hidden="true" />
      </section>

      {/* ── CATALOG ──────────────────────────────────────────── */}
      <main className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-20">
          {CATEGORY_ORDER.map((category) => {
            const items = FEATURES.filter((f) => f.category === category);
            if (items.length === 0) return null;
            return (
              <section key={category} className="ft-cat">
                <div className="ft-cat-head">
                  <h2 className="ft-cat-name">{category}</h2>
                  <span className="ft-cat-blurb">{CATEGORY_BLURB[category]}</span>
                </div>
                <div className="ft-grid">
                  {items.map((f) => {
                    const Icon = f.icon;
                    return (
                      <Link key={f.slug} href={`/features/${f.slug}`} className="ft-card group">
                        <span className="ft-card-icon">
                          <Icon className="size-5" strokeWidth={1.6} />
                        </span>
                        <h3 className="ft-card-title">{f.title}</h3>
                        <p className="ft-card-tagline">{f.tagline}</p>
                        <span className="ft-card-more">
                          了解更多
                          <ArrowRight className="size-3.5" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── CTA ────────────────────────────────────────────── */}
        <div className="section-divider mx-auto max-w-5xl" />
        <section className="mx-auto max-w-5xl px-6 pb-32 pt-24 text-center">
          <h2
            className="text-[clamp(2rem,4vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.025em]"
            style={{ color: "var(--th-text-heading)" }}
          >
            几分钟内部署你的第一个应用。
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[16px] leading-[1.6]" style={{ color: "var(--th-text-body)" }}>
            自托管免费，或在 Openship Cloud 上托管。两种方式工作流一致。
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/download" className="th-btn group rounded-full px-7 py-3 text-[15px] font-medium">
              开始使用
              <ArrowRight className="ml-1.5 -mr-1 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/docs" className="th-btn-ghost group rounded-full px-7 py-3 text-[15px] font-medium">
              阅读文档
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
