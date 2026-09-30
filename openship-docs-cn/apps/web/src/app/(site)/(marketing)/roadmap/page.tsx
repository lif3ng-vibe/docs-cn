import type { Metadata } from "next";
import Link from "next/link";
import {
  Boxes, Scale, Webhook, Layers, ShieldAlert, Globe, Gitlab, Cloud, Smartphone,
  Container, Palette, Braces, CloudCog, Cloudy, Send, Blocks, SquareTerminal, GitPullRequest,
  FolderSync, Database,
  type LucideIcon,
} from "lucide-react";
import { Navbar, Footer } from "@/components/landing";
import { RoadmapHeroArt } from "./_components/RoadmapHeroArt";
import "./roadmap.css";

const PAGE_TITLE = "路线图";
const PAGE_DESCRIPTION =
  "Openship 的前进方向——每个技术栈的原生构建流水线、一键操作的集群与负载均衡、Webhook 触发的任务、持久化队列、托管 WAF、自托管 CDN、GitLab 与 Cloudflare 集成，以及移动应用。公开构建。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/roadmap" },
  openGraph: { title: `${PAGE_TITLE} — Openship`, description: PAGE_DESCRIPTION, url: "/roadmap", type: "website" },
  twitter: { card: "summary_large_image", title: `${PAGE_TITLE} — Openship`, description: PAGE_DESCRIPTION },
};

type Status = "shipped" | "progress" | "next" | "planned" | "exploring";
const STATUS: Record<Status, string> = {
  shipped: "已交付",
  progress: "进行中",
  next: "接下来",
  planned: "已列入计划",
  exploring: "探索中",
};

type Item = { icon: LucideIcon; title: string; desc: string; status: Status };
type Phase = {
  n: string;
  name: string;
  blurb: string;
  items: Item[];
  flagship?: boolean;
  pitch?: string;
  /** Optional "help us get here faster" link rendered under the phase. */
  cta?: { label: string; href: string };
};

const PHASES: Phase[] = [
  {
    n: "01",
    name: "部署一切",
    blurb: "为每个技术栈打造原生流水线。",
    pitch:
      "Node.js 与 Docker 如今已可原生部署——Openship 自动识别、构建并运行它们，零配置。其他所有技术栈——Go、Rust、Python、Ruby、PHP、Java 与 Kotlin、.NET、Elixir——也已能通过通用流水线交付：带上你的安装、构建、启动命令（或一个 Dockerfile）即可部署。下一步，我们将把每种语言逐个升级为一等公民的自动识别原生支持——一次一个技术栈，有你帮忙会更快。",
    cta: {
      label: "贡献一条技术栈流水线",
      href: "https://github.com/oblien/openship/contribute",
    },
    items: [
      {
        icon: Blocks,
        title: "原生构建器：Node.js 与 Docker",
        status: "shipped",
        desc: "为最重的两类场景自动识别构建与运行——整个 JavaScript/TypeScript 框架家族，以及任何 Dockerfile 或 Compose 文件。无需写命令，无需选镜像：关联仓库即可交付。",
      },
      {
        icon: SquareTerminal,
        title: "每种语言的一等识别",
        status: "next",
        desc: "Go、Rust、Python、Ruby、PHP、Java/Kotlin、.NET 和 Elixir 将成为自动识别的原生支持——合理的构建镜像与安装、构建、启动命令都会替你推断。在逐一落地之前，通用流水线已能用你自己的命令部署它们，期间不会有任何阻塞。",
      },
    ],
  },
  {
    n: "02",
    name: "横向扩展",
    blurb: "一个部署目标，多台机器。",
    items: [
      {
        icon: Boxes,
        title: "集群与多节点",
        status: "progress",
        desc: "把服务器组成一个集群，作为整体交付。在控制台添加一个节点，Openship 就会把容器分布到整个机群、执行健康检查，并自动重新调度失败的容器——无需看护控制面，也无需手写 YAML。",
      },
      {
        icon: FolderSync,
        title: "跨节点共享卷",
        status: "planned",
        desc: "跟随应用在机群间迁移的卷——一个共享的、可复制的文件夹，任何节点都可读写。上传、缓存与有状态数据不再被钉死在单台机器上，容器可以调度到任何位置而不丢文件。",
      },
      {
        icon: Database,
        title: "数据库集群与副本",
        status: "planned",
        desc: "把托管数据库变成集群：读副本分摊查询负载，跨节点流式复制，自动故障转移——丢一台机器不等于停机。控制台一键完成，无需手动 pg_basebackup。",
      },
      {
        icon: Container,
        title: "Docker Swarm",
        status: "planned",
        desc: "偏爱 Swarm？把 Openship 指向一个 Swarm 集群，在同一个控制台里部署服务、扩缩副本、跨 swarm 滚动更新——编排器你选，界面我来。",
      },
      {
        icon: Scale,
        title: "负载均衡",
        status: "progress",
        desc: "开箱即用地把流量分发到健康节点，附权重滑块，每次部署自动排空连接。零停机发布成为默认，而不是周末项目。",
      },
    ],
  },
  {
    n: "03",
    name: "自动化",
    blurb: "会响应的任务，任何规模。",
    items: [
      {
        icon: Webhook,
        title: "事件与 Webhook 触发器",
        status: "shipped",
        desc: "从入站 Webhook 触发部署或任务——每个钩子都有自己的令牌或 HMAC 认证的 URL——或从 git push 触发。下一步是把这些触发器与平台事件（部署完成、健康检查失败）串成自动运转的流水线。",
      },
      {
        icon: Layers,
        title: "队列与高级执行器",
        status: "next",
        desc: "每个任务背后都有持久化队列：并发限制、退避重试、分布式 worker，以及崩溃安全的重新驱动，被中断的运行绝不消失。任务还是你熟悉的写法——底层已是生产级。",
      },
    ],
  },
  {
    n: "04",
    name: "路由与防护",
    blurb: "你的边缘，你的规则。",
    items: [
      {
        icon: ShieldAlert,
        title: "高级路由规则与 WAF",
        status: "progress",
        desc: "按路由的规则——速率限制、地区与 User-Agent 过滤、封禁、防盗链——已在自托管上线，在控制台编辑、即时生效，无需重载或配置文件。接下来：把它们组合成托管 WAF，并让云端获得同样的规则。",
      },
      {
        icon: Globe,
        title: "自托管 CDN",
        status: "planned",
        desc: "集群就绪后，把它变成你自己的 CDN：从每个节点缓存并就近向用户提供静态资源。没有第三方，没有按 GB 计费的账单——只是你的机群，做了更多事。",
      },
    ],
  },
  {
    n: "05",
    name: "打上你的印记",
    blurb: "你的品牌，你的外观。",
    items: [
      {
        icon: Palette,
        title: "白标与品牌定制",
        status: "planned",
        desc: "把你的名字放上去。替换 logo、配色、产品名与登录页，让你的团队——或你的客户——看到的控制台一眼就是你的。为代理机构与转售商而生。",
      },
      {
        icon: Braces,
        title: "自定义 CSS",
        status: "planned",
        desc: "放入你自己的 CSS，重塑任意样式，从一个点缀色到整套换肤。与白标配合，整个界面可以精确到像素地贴合你的品牌。",
      },
    ],
  },
  {
    n: "06",
    name: "驾驭云端",
    blurb: "AWS 与 Azure，终于顺心了。",
    flagship: true,
    pitch: "AWS 与 Azure 无比强大，也无比复杂。数百种服务、迷宫般的控制台，还有一份要拿着学位才读得懂的账单。如果你不想要这些——如果你只想看看在跑什么、拉起一个东西，然后继续干活——Openship 会成为覆盖两者的一个干净、有主见的分层：只留你真正使用的那 20%，去掉用不上的 80%。连接你的账户，就在你部署的同一处管理它们。",
    items: [
      {
        icon: CloudCog,
        title: "AWS 控制台与管理",
        status: "exploring",
        desc: "连接你的 AWS 账户，从 Openship 运行——EC2、S3、RDS、IAM 等——经由一个真正快速、干净界面。日常接触的服务有了一个更好的控制台，就在你的部署旁边。",
      },
      {
        icon: Cloudy,
        title: "Azure 控制台与管理",
        status: "exploring",
        desc: "Azure 同样如此：连接一个订阅，在同一个清爽界面上管理虚拟机、存储、数据库与网络——不用再在门户里翻找才能办成一件事。",
      },
    ],
  },
  {
    n: "07",
    name: "集成",
    blurb: "连接你技术栈的其余部分。",
    items: [
      {
        icon: Gitlab,
        title: "GitLab 集成",
        status: "planned",
        desc: "与 GitHub 并列的一等 GitLab 支持——仓库、分支、合并请求预览环境与推送即部署，接线方式与你已熟悉的完全一致。",
      },
      {
        icon: Cloud,
        title: "Cloudflare 集成",
        status: "planned",
        desc: "直接从 Openship 管理 Cloudflare 的 DNS、代理与源站证书，让你的域名与边缘随每次部署保持同步——不必再开一堆标签页对记录。",
      },
      {
        icon: Send,
        title: "Amazon SES 与 SMTP 邮件",
        status: "shipped",
        desc: "不止于自托管邮件：接入 Amazon SES 或任意 SMTP 中继，在 Openship 中管理发件人、域名与送达率——按需选择托管或自有的邮件引擎。今日已上线。",
      },
    ],
  },
];

const LATER: Item = {
  icon: Smartphone,
  title: "移动应用",
  status: "exploring",
  desc: "从口袋里掌控你的机群——部署、实时日志与告警在事发瞬间推送到手机。端到端直连你自己的自托管实例，中间没有云端中介。",
};

function StatusPill({ status }: { status: Status }) {
  const variant =
    status === "progress" ? "rm-status--active" : status === "shipped" ? "rm-status--shipped" : "";
  return <span className={`rm-status ${variant}`}>{STATUS[status]}</span>;
}

function MilestoneCard({ item, accent }: { item: Item; accent?: boolean }) {
  const Icon = item.icon;
  return (
    <div
      className={`rm-card rounded-2xl p-7 ${accent ? "rm-card--accent" : ""}`}
      style={{ background: "var(--th-card-bg)", border: "1px solid var(--th-card-bd)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={
            accent
              ? { background: "rgba(139,124,246,.12)", border: "1px solid rgba(167,139,250,.3)" }
              : { background: "var(--th-sf-04)", border: "1px solid var(--th-on-06)" }
          }
        >
          <Icon className="size-5" strokeWidth={1.6} style={{ color: accent ? "#c4b5fd" : "var(--th-text-heading)" }} />
        </div>
        <StatusPill status={item.status} />
      </div>
      <h3 className="mt-5 text-[18px] font-medium tracking-[-0.01em]" style={{ color: "var(--th-text-heading)" }}>
        {item.title}
      </h3>
      <p className="mt-2 text-[14.5px] leading-[1.65]" style={{ color: "var(--th-text-body)" }}>
        {item.desc}
      </p>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="rm-hero hero-section relative flex min-h-[78dvh] flex-col items-center justify-center overflow-hidden">
        <div className="hero-grain absolute inset-0" aria-hidden="true" />
        <div className="hero-grid absolute inset-0" aria-hidden="true" />
        <div className="hero-aurora" aria-hidden="true">
          <div className="hero-aurora-core" />
          <div className="hero-aurora-wing hero-aurora-wing--left" />
          <div className="hero-aurora-wing hero-aurora-wing--right" />
        </div>

        <div className="relative z-20 mx-auto w-full max-w-[820px] px-6 text-center">
          <p className="animate-fade-in-up text-[12px] font-semibold uppercase tracking-[0.16em] th-text-muted">
            路线图
          </p>
          <h1 className="animate-fade-in-up animate-delay-100 mt-5">
            <span className="block text-[clamp(2.5rem,5.5vw,4.25rem)] font-medium leading-[1.08] tracking-[-0.02em] th-text-heading">
              Openship 的前进方向。
            </span>
            <span className="hero-headline-second block text-[clamp(2.5rem,5.5vw,4.25rem)] font-light italic leading-[1.08] tracking-[-0.015em]">
              公开构建。
            </span>
          </h1>
          <p className="animate-fade-in-up animate-delay-200 mx-auto mt-6 max-w-[560px] text-[16px] leading-[1.65] th-text-body">
            接下来的篇章——每个技术栈的原生构建、一键开启的集群、自我触发的任务、
            你自己的边缘与 CDN，以及你们呼唤的集成。
            公开塑形，以开源交付。
          </p>

          {/* Animated journey vector — replaces the status-pill legend (every
              milestone card still shows its own status inline). */}
          <div className="animate-fade-in-up animate-delay-300">
            <RoadmapHeroArt />
          </div>
        </div>

        <div className="hero-edge-fade-top absolute top-0 left-0 right-0 h-20" aria-hidden="true" />
        <div className="hero-edge-fade-bottom absolute bottom-0 left-0 right-0 h-40" aria-hidden="true" />
      </section>

      <main className="relative">
        {/* ── PHASES ─────────────────────────────────────────── */}
        {PHASES.map((phase, i) => (
          <section key={phase.n} className="mx-auto max-w-5xl px-6">
            {i === 0 ? <div className="pt-20 sm:pt-24" /> : <div className="rm-spine" />}
            <div className="pb-20 pt-6 sm:pb-24">
              <div className="mb-9">
                <div className="flex items-center gap-3">
                  <p className="font-mono text-[13px] tracking-[0.08em]" style={{ color: "var(--th-text-muted)" }}>
                    阶段 · {phase.n}
                  </p>
                  {phase.flagship && <span className="rm-flagship">★ 旗舰</span>}
                </div>
                <h2
                  className="mt-2.5 text-[clamp(1.75rem,3.6vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.025em]"
                  style={{ color: "var(--th-text-heading)" }}
                >
                  {phase.name}{" "}
                  <span className="font-light italic" style={{ color: "var(--th-on-40)" }}>
                    —— {phase.blurb}
                  </span>
                </h2>
              </div>
              {phase.pitch && (
                <div className="rm-pitch mb-4">
                  <p>{phase.pitch}</p>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {phase.items.map((item) => (
                  <MilestoneCard key={item.title} item={item} accent={phase.flagship} />
                ))}
              </div>
              {phase.cta && (
                <a
                  href={phase.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rm-contribute"
                >
                  <GitPullRequest className="size-4" strokeWidth={1.7} />
                  {phase.cta.label}
                  <svg className="ml-0.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              )}
            </div>
          </section>
        ))}

        {/* ── LATER ──────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6">
          <div className="rm-spine" />
          <div className="pb-24 pt-6">
            <div className="mb-9">
              <p className="font-mono text-[13px] tracking-[0.08em]" style={{ color: "var(--th-text-muted)" }}>
                更远
              </p>
              <h2
                className="mt-2.5 text-[clamp(1.75rem,3.6vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.025em]"
                style={{ color: "var(--th-text-heading)" }}
              >
                不止于浏览器{" "}
                <span className="font-light italic" style={{ color: "var(--th-on-40)" }}>
                  ——在你口袋里。
                </span>
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <MilestoneCard item={LATER} />
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────── */}
        <div className="section-divider mx-auto max-w-5xl" />
        <section className="mx-auto max-w-5xl px-6 pb-32 pt-24 sm:pb-40">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="text-[clamp(2rem,4vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.025em]"
              style={{ color: "var(--th-text-heading)" }}
            >
              与我们一起塑造它。
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[16px] leading-[1.6]" style={{ color: "var(--th-text-body)" }}>
              这里的一切都公开构建。提交 issue、为你关心的方向投票，或发起
              pull request——路线图跟随社区。
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href="https://github.com/oblien/openship"
                target="_blank"
                rel="noopener noreferrer"
                className="th-btn group rounded-full px-7 py-3 text-[15px] font-medium"
              >
                <svg className="-ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                在 GitHub 关注
              </a>
              <Link href="/docs" className="th-btn-ghost group rounded-full px-7 py-3 text-[15px] font-medium">
                阅读文档
                <svg className="ml-1.5 -mr-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
