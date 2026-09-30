import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/landing";

const PAGE_TITLE = "服务条款";
const PAGE_DESCRIPTION =
  "适用于 Openship Cloud 与 Openship Business 的条款。自托管平台本身遵循 Apache 2.0 许可。语言平实，不含隐藏条款。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: {
    title: `${PAGE_TITLE} - Openship`,
    description: PAGE_DESCRIPTION,
    url: "/terms",
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
    id: "agreement",
    title: "协议",
    body: [
      "本条款适用于你对 Openship Cloud（托管服务）与 Openship Business（云端 + 你的服务器 + SLA）的使用。自托管平台本身遵循随源码附带的 Apache 2.0 许可。",
      "创建账户即表示你同意本条款。若你代表某一组织使用 Openship，即确认你有权约束该组织。",
    ],
  },
  {
    id: "the-service",
    title: "服务内容",
    body: [
      "我们提供用于构建、交付与运行应用的基础设施——托管数据库、邮件、存储、路由，以及围绕它们的平台工具。",
      "Openship Cloud 按公开发布的订阅套餐提供（详见定价页），并在此之上按用量计收点数。在 Apache 2.0 许可下，自托管使用免费。",
      "我们可能随时改进服务、修复缺陷或演进功能。实质性破坏性变更会提前至少 30 天通知。",
    ],
  },
  {
    id: "your-account",
    title: "你的账户",
    body: [
      "你有责任妥善保管凭据，并对账户下的操作负责。如发现疑似未授权使用，请立即告知我们。",
      "你不得共享登录凭据、试图绕过用量限制，或干扰共享基础设施上其他客户的工作负载。",
    ],
  },
  {
    id: "your-content",
    title: "你的内容",
    body: [
      "你的代码、数据、域名以及你通过平台交付的一切均归你所有。你仅授予我们运行服务所需的权限——拉取仓库、构建镜像、路由流量、存储备份、投递邮件。",
      "你需确保对所部署的内容拥有相应权利。我们不审查用户内容；仅在收到明确的法律违规举报时（DMCA、制裁、儿童性虐待材料）才可能采取行动。",
    ],
  },
  {
    id: "acceptable-use",
    title: "可接受使用",
    body: [
      "禁止对基础设施（无论你自己的还是他人的）发起定向攻击，禁止垃圾邮件中继、加密货币挖矿、恶意软件分发，以及运行制裁名单上的工作负载。",
      "大流量外发邮件必须使用已验证的域名和信誉良好的许可式订阅流程。反复退信或垃圾邮件投诉将触发送达能力审查。",
      "若工作负载因可接受使用原因被暂停，你会立即收到通知，并获得整改路径。永久终止仅适用于明确、屡次或严重的违规。",
    ],
  },
  {
    id: "billing",
    title: "计费",
    body: [
      "Openship Cloud 套餐价格公布于定价页。付费套餐按月预付，可随时取消；取消在已付费周期结束时生效。自托管使用免费。",
      "我们经由 Stripe 接受主流银行卡。你所订阅套餐的价格调整会提前至少 30 天公布，并从你的下一个计费周期开始生效。扣款失败时，我们会先重试并发送邮件通知，之后才会暂停服务。",
    ],
  },
  {
    id: "uptime-sla",
    title: "在线率与 SLA",
    body: [
      "Openship Cloud 以尽力而为的方式追求每月 99.9% 的在线率；符合条件的付费套餐可享有合同化 SLA 与服务补偿。",
      "计划内维护会提前至少 7 天公布，且不计入在线率统计。",
    ],
  },
  {
    id: "data-portability",
    title: "数据可携性",
    body: [
      "Openship 上的每次部署都是普通容器镜像加标准清单。你可以随时离开，在自己的基础设施上重跑，无需改写代码。",
      "一经请求，我们会以标准格式完整导出你的数据库、机密与配置。导出一概不收费。",
    ],
  },
  {
    id: "warranty",
    title: "免责声明",
    body: [
      "服务按“原样”提供。在法律允许的最大范围内，我们不作适销性与特定用途适用性的默示保证。",
      "我们不保证服务不中断、无错误或满足你的特定要求——尽管我们会全力以赴。",
    ],
  },
  {
    id: "liability",
    title: "责任限制",
    body: [
      "在法律允许的最大范围内，任何一方均不对间接、附带或后果性损害承担责任。",
      "我们在本条款下的总责任，以上述主张提出前 12 个月内你向我们支付的费用为上限。自托管用户（我们分文不取）适用相应上限。",
    ],
  },
  {
    id: "termination",
    title: "终止",
    body: [
      "你可随时在账户设置中取消。对实质性违反本条款的账户，我们可能予以终止；在合理情形下会先行通知并给予整改机会。",
      "终止后，我们会在 30 天内删除身份识别数据，法律要求保留的除外（税务、争议记录）。",
    ],
  },
  {
    id: "law",
    title: "管辖法律",
    body: [
      "本条款受爱尔兰法律管辖。争议由都柏林法院解决，但适用法律赋予你在当地法院提起诉讼权利的情形除外。",
    ],
  },
  {
    id: "changes",
    title: "条款变更",
    body: [
      "实质性变更时，我们会提前至少 14 天邮件通知账户所有者。生效日期后继续使用即视为接受；如不同意，取消订阅将按比例退还未使用的预付时长。",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="legal-root">

        <section className="legal-hero">
          <div className="legal-container">
            <p className="legal-eyebrow">服务条款</p>
            <h1 className="legal-title">
              规则在此，<br />
              <span className="legal-title-soft">语言平实。</span>
            </h1>
            <p className="legal-meta">
              最后更新于 <time dateTime="2026-05-18">2026&nbsp;年&nbsp;5&nbsp;月&nbsp;18&nbsp;日</time>
              <span className="legal-meta-sep">·</span>
              <a href="https://github.com/oblien/openship/commits/main/TERMS.md" className="legal-meta-link" target="_blank" rel="noreferrer">
                在 GitHub 查看版本历史
              </a>
            </p>
          </div>
        </section>

        <section className="legal-body">
          <div className="legal-container">
            <div className="legal-grid">
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
                    有疑问？致函{" "}
                    <a href="mailto:legal@openship.io">legal@openship.io</a>。
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
