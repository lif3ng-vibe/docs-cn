import type { Metadata } from "next";
import { BRAND_LINKS, SUPPORT_EMAIL } from "@repo/core";
import { Navbar, Footer } from "@/components/landing";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "支持",
  description: "获取 Openship Cloud、部署、账户或计费方面的帮助。",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <>
      <Navbar />
      <main className="legal-root">
        <section className="legal-hero">
          <div className="legal-container">
            <p className="legal-eyebrow">Openship 支持</p>
            <h1 className="legal-title">
              帮你扫清障碍。
              <br />
              <span className="legal-title-soft">与我们的团队聊聊。</span>
            </h1>
            <p className="legal-meta">
              无论是部署、Cloud 账户还是计费问题，都可以在此求助。
              即使无法登录，也能在这里提交请求。
            </p>
          </div>
        </section>
        <section className="legal-body">
          <div className="legal-container">
            <div className="legal-grid">
              <aside className="legal-toc" aria-label="支持链接">
                <p className="legal-toc-title">随时为你服务</p>
                <ol>
                  <li>
                    <a href={`mailto:${SUPPORT_EMAIL}`}>
                      <span className="legal-toc-n">01</span>
                      {SUPPORT_EMAIL}
                    </a>
                  </li>
                  <li>
                    <a href={BRAND_LINKS.docs}>
                      <span className="legal-toc-n">02</span>文档
                    </a>
                  </li>
                  <li>
                    <a href={BRAND_LINKS.community} target="_blank" rel="noreferrer">
                      <span className="legal-toc-n">03</span>社区
                    </a>
                  </li>
                </ol>
              </aside>
              <article className="legal-article">
                <section className="legal-section" style={{ borderBottom: "none" }}>
                  <ContactForm source="support" />
                </section>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
