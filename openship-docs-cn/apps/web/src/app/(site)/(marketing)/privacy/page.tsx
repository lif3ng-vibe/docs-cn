import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/landing";

const PAGE_TITLE = "隐私政策";
const PAGE_DESCRIPTION =
  "Openship 如何处理你的数据：收集什么、为何收集、存放在哪里、如何删除。我们不出售个人数据，也不展示广告。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: `${PAGE_TITLE} - Openship`,
    description: PAGE_DESCRIPTION,
    url: "/privacy",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} - Openship`,
    description: PAGE_DESCRIPTION,
  },
};

const SECTIONS = [
  {
    id: "overview",
    title: "总览",
    body: [
      "Openship 是一个部署平台。使用 Openship Cloud 时，我们代你托管代码、机密与基础设施。自行托管时，一切都留在你自己的机器上，本政策仅适用于你与之交互的服务部分（账户、计费、支持）。",
      "本政策说明我们收集什么、为何收集、存放在哪里以及如何删除。我们不出售个人数据，也不展示广告。",
    ],
  },
  {
    id: "what-we-collect",
    title: "我们收集什么",
    body: [
      "账户数据——电子邮箱、哈希后的密码（或 OAuth 身份）、团队名称以及你的角色。",
      "计费数据——仅限 Cloud 与 Business 套餐。银行卡与税务信息由 Stripe 处理；我们只保存卡号后四位与账单历史。",
      "项目元数据——仓库 URL、分支、构建命令、环境变量名称（不含值）、域名、部署时间戳。",
      "构建产物——我们代你构建的容器镜像。其保存期限与部署一致，并按我们的保留策略清理。",
      "日志——应用与构建日志，Cloud 保留 30 天，Business 保留 12 个月。",
      "遥测数据——默认关闭。若你选择加入，我们会收集匿名的平台版本与功能使用事件，用于规划产品路线图。",
    ],
  },
  {
    id: "what-we-dont",
    title: "我们不收集什么",
    body: [
      "构建时段之外的源码——我们拉取仓库、完成构建后即丢弃工作区，留存下来的只有镜像。",
      "解密后的机密——环境变量静态加密存储，密钥绝不写入日志。",
      "流经你应用的用户数据。你的数据库与应用日志属于你的数据；我们代为托管，但不会读取。",
      "针对你终端用户的行为分析。",
    ],
  },
  {
    id: "where-it-lives",
    title: "数据的存放位置",
    body: [
      "Cloud 用户——主存储位于 EU-West（爱尔兰），并在 US-East 与 AP-South 设有副本。你可以将项目固定在单一区域。",
      "自托管用户——一切都在你运行的机器上，我们完全无法查看。",
      "备份——加密存储、固定区域，Cloud 为 30 天滚动窗口，Business 可延长保留。",
    ],
  },
  {
    id: "third-parties",
    title: "第三方处理方",
    body: [
      "Stripe——支付处理与账单开具。",
      "AWS、Hetzner、Cloudflare——计算、网络与边缘侧的基础设施提供商。",
      "Postmark——对外事务性邮件（账户事件、计费收据）。",
      "Sentry——错误上报，已启用个人身份信息清洗。",
      "我们不使用营销追踪器、广告像素或会话回放工具。",
    ],
  },
  {
    id: "rights",
    title: "你的权利",
    body: [
      "访问权——可要求以机器可读的形式导出我们掌握的关于你的全部数据。",
      "删除权——可随时删除账户；我们会在 30 天内抹除身份识别数据，仅保留税法要求的内容。",
      "可携权——每次部署都是一个普通容器镜像加一份标准清单。你可以随时离开 Cloud，在自己的服务器上原样重跑，无需改写任何东西。",
      "如需行使上述任何权利，请致函 privacy@openship.io。我们会在 5 个工作日内回复。",
    ],
  },
  {
    id: "changes",
    title: "政策变更",
    body: [
      "本政策发生实质性变更时，我们会在生效前至少 14 天邮件通知账户所有者，并附上变更内容与缘由的逐项对照。",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="legal-root">

        <section className="legal-hero">
          <div className="legal-container">
            <p className="legal-eyebrow">隐私</p>
            <h1 className="legal-title">
              我们如何<br />
              <span className="legal-title-soft">处理你的数据。</span>
            </h1>
            <p className="legal-meta">
              最后更新于 <time dateTime="2026-05-18">2026&nbsp;年&nbsp;5&nbsp;月&nbsp;18&nbsp;日</time>
              <span className="legal-meta-sep">·</span>
              <a href="https://github.com/oblien/openship/commits/main/PRIVACY.md" className="legal-meta-link" target="_blank" rel="noreferrer">
                在 GitHub 查看版本历史
              </a>
            </p>
          </div>
        </section>

        <section className="legal-body">
          <div className="legal-container">
            <div className="legal-grid">
              {/* Table of contents */}
              <aside className="legal-toc" aria-label="目录">
                <p className="legal-toc-title">本页内容</p>
                <ol>
                  {SECTIONS.map((s, i) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`}>
                        <span className="legal-toc-n">{String(i + 1).padStart(2, "0")}</span>
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </aside>

              {/* Article */}
              <article className="legal-article">
                {SECTIONS.map((s, i) => (
                  <section key={s.id} id={s.id} className="legal-section">
                    <header className="legal-section-head">
                      <span className="legal-section-n">{String(i + 1).padStart(2, "0")}</span>
                      <h2 className="legal-section-title">{s.title}</h2>
                    </header>
                    {s.body.map((p, j) => (
                      <p key={j} className="legal-p">{p}</p>
                    ))}
                  </section>
                ))}

                <footer className="legal-foot">
                  <p>
                    有问题或请求？致函{" "}
                    <a href="mailto:privacy@openship.io">privacy@openship.io</a>。
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
