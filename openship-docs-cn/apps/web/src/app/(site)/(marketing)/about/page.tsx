import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/landing";

const PAGE_TITLE = "关于我们";
const PAGE_DESCRIPTION =
  "Openship 是一个开源部署平台，由 Oblien 团队构建和维护。Apache 2.0 许可，源码托管在 GitHub，可随处运行。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `${PAGE_TITLE} - Openship`,
    description: PAGE_DESCRIPTION,
    url: "/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} - Openship`,
    description: PAGE_DESCRIPTION,
  },
};

const TOC = [
  { id: "what", title: "我们做什么" },
  { id: "open-source", title: "开源" },
  { id: "who", title: "背后团队" },
  { id: "involved", title: "参与贡献" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="legal-root">
        <section className="legal-hero">
          <div className="legal-container">
            <p className="legal-eyebrow">关于</p>
            <h1 className="legal-title">
              部署由你掌握，<br />
              <span className="legal-title-soft">从内到外彻底开源。</span>
            </h1>
            <p className="legal-meta">
              由{" "}
              <a href="https://oblien.com" className="legal-meta-link" target="_blank" rel="noreferrer">
                Oblien
              </a>
              {" "}团队构建和维护。
            </p>
          </div>
        </section>

        <section className="legal-body">
          <div className="legal-container">
            <div className="legal-grid">
              <aside className="legal-toc" aria-label="目录">
                <p className="legal-toc-title">本页内容</p>
                <ol>
                  {TOC.map((t, i) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`}>
                        <span className="legal-toc-n">{String(i + 1).padStart(2, "0")}</span>
                        {t.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </aside>

              <article className="legal-article">
                <section id="what" className="legal-section">
                  <header className="legal-section-head">
                    <span className="legal-section-n">01</span>
                    <h2 className="legal-section-title">我们做什么</h2>
                  </header>
                  <p className="legal-p">
                    Openship 是一个由你自己运行的部署平台。把它指向一个仓库，它便会识别你的技术栈、完成构建，
                    并交付到你拥有的任意 Linux 服务器——数据库、域名、SSL、邮件与备份，尽在一处管理。
                  </p>
                  <p className="legal-p">
                    同一平台提供 CLI、Web 控制台与桌面应用三种形态。按你的工作方式任选其一，它们驱动的都是同一个后端。
                  </p>
                </section>

                <section id="open-source" className="legal-section">
                  <header className="legal-section-head">
                    <span className="legal-section-n">02</span>
                    <h2 className="legal-section-title">开源</h2>
                  </header>
                  <p className="legal-p">
                    Openship 是基于{" "}
                    <a href="https://github.com/oblien/openship/blob/main/LICENSE" target="_blank" rel="noreferrer">
                      Apache License 2.0
                    </a>
                    {" "}许可的开源软件。控制台、CLI、代理与基础设施适配器全部公开在{" "}
                    <a href="https://github.com/oblien/openship" target="_blank" rel="noreferrer">GitHub</a>，可随时审计。
                  </p>
                  <p className="legal-p">
                    每次部署都是带标准清单的标准 Docker 容器——没有专有格式，也不会被锁定。无论是树莓派、单台 VPS
                    还是成批服务器都能运行，并可随时在云服务商之间迁移。
                  </p>
                </section>

                <section id="who" className="legal-section">
                  <header className="legal-section-head">
                    <span className="legal-section-n">03</span>
                    <h2 className="legal-section-title">背后团队</h2>
                  </header>
                  <p className="legal-p">
                    Openship 由{" "}
                    <a href="https://oblien.com" target="_blank" rel="noreferrer">Oblien</a>（Oblien LLC）团队构建
                    和维护，该公司专注于云与开发者基础设施。对每一位用它部署的用户，它始终以 Apache 2.0 保持开放。
                  </p>
                  <p className="legal-p">
                    Openship Cloud——托管版本——由 Oblien 运营，但平台本身永久免费，随时可供你自行托管。
                  </p>
                </section>

                <section id="involved" className="legal-section">
                  <header className="legal-section-head">
                    <span className="legal-section-n">04</span>
                    <h2 className="legal-section-title">参与贡献</h2>
                  </header>
                  <p className="legal-p">
                    在{" "}
                    <a href="https://github.com/oblien/openship" target="_blank" rel="noreferrer">GitHub</a>{" "}
                    上为项目加星或 fork、提交 issue、发起 pull request。Bug 反馈与功能建议我们都真诚欢迎——文档和
                    平台会因此进步得最快。
                  </p>
                  <p className="legal-p">
                    初次接触？从 <a href="/docs">文档</a> 开始，或{" "}
                    <a href="/download">一条命令完成安装</a>。
                  </p>
                </section>

                <footer className="legal-foot">
                  <p>
                    想联系我们？前往 <a href="/contact">联系方式</a>。
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
