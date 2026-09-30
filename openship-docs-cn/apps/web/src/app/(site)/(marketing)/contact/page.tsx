import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/landing";
import { ContactForm } from "@/components/contact-form";
import { SUPPORT_EMAIL } from "@repo/core";

const PAGE_TITLE = "联系我们";
const PAGE_DESCRIPTION =
  "与 Openship 团队取得联系。给我们留言，我们会尽快回复。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `${PAGE_TITLE} - Openship`,
    description: PAGE_DESCRIPTION,
    url: "/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} - Openship`,
    description: PAGE_DESCRIPTION,
  },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="legal-root">
        <section className="legal-hero">
          <div className="legal-container">
            <p className="legal-eyebrow">联系我们</p>
            <h1 className="legal-title">
              我们随时待命。<br />
              <span className="legal-title-soft">给我们留言吧。</span>
            </h1>
            <p className="legal-meta">
              向 Openship 团队发送请求。我们会把它保存下来，并通过邮件回复。
            </p>
          </div>
        </section>

        <section className="legal-body">
          <div className="legal-container">
            <div className="legal-grid">
              <aside className="legal-toc" aria-label="联系信息">
                <p className="legal-toc-title">联系信息</p>
                <ol>
                  <li>
                    <a href={`mailto:${SUPPORT_EMAIL}`}>
                      <span className="legal-toc-n">01</span>
                      {SUPPORT_EMAIL}
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/oblien/openship/issues" target="_blank" rel="noreferrer">
                      <span className="legal-toc-n">02</span>
                      GitHub issues
                    </a>
                  </li>
                  <li>
                    <a href="mailto:security@oblien.com">
                      <span className="legal-toc-n">03</span>
                      安全
                    </a>
                  </li>
                  <li>
                    <a href="mailto:privacy@openship.io">
                      <span className="legal-toc-n">04</span>
                      隐私
                    </a>
                  </li>
                  <li>
                    <a href="mailto:legal@openship.io">
                      <span className="legal-toc-n">05</span>
                      法律
                    </a>
                  </li>
                </ol>
              </aside>

              <article className="legal-article">
                <section className="legal-section" style={{ borderBottom: "none" }}>
                  <ContactForm />
                </section>

                <footer className="legal-foot">
                  <p>
                    更想看文档？阅读 <a href="/docs">文档</a> 或{" "}
                    <a href="/trust">信任与安全</a>。
                  </p>
                </footer>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
