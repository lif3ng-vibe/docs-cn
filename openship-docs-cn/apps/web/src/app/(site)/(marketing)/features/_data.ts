import {
  Rocket,
  GitBranch,
  Boxes,
  Layers,
  Undo2,
  ScrollText,
  Scale,
  CalendarClock,
  Globe,
  Cable,
  ShieldAlert,
  Database,
  Mail,
  LayoutDashboard,
  Bot,
  type LucideIcon,
} from "lucide-react";

/**
 * Features catalog — one source of truth for the `/features` grid and each
 * `/features/[slug]` detail page. `screenshot` is a `/public` path when a real
 * capture exists, or `null` to render the framed placeholder (see FeatureShot).
 * Keep copy honest: describe what ships today.
 */

export type FeatureCategory = "部署" | "运行" | "连接" | "数据" | "管理";

export const CATEGORY_ORDER: FeatureCategory[] = ["部署", "运行", "连接", "数据", "管理"];

export const CATEGORY_BLURB: Record<FeatureCategory, string> = {
  部署: "从你的代码到生产环境。",
  运行: "任何规模下都保持健康。",
  连接: "你的边缘、域名与网络。",
  数据: "有状态服务，托管代维。",
  管理: "以你的方式驾驭。",
};

export interface Feature {
  slug: string;
  title: string;
  category: FeatureCategory;
  /** One line for the grid card + detail sub-header. */
  tagline: string;
  icon: LucideIcon;
  /** `/public` path, or null → framed placeholder. */
  screenshot: string | null;
  /** Lead paragraph on the detail hero. */
  summary: string;
  /** Body paragraphs on the detail page. */
  body: string[];
  /** 3–4 concrete sub-capabilities. */
  highlights: { title: string; desc: string }[];
}

export const FEATURES: Feature[] = [
  // ── Deploy ────────────────────────────────────────────────────────────────
  {
    slug: "deploy-anywhere",
    title: "随处部署",
    category: "部署",
    tagline: "Openship Cloud、你自己的 VPS，还是家庭实验室——一套工作流。",
    icon: Rocket,
    screenshot: null,
    summary:
      "无论跑在哪里，部署体验一致。交付到 Openship Cloud、接入你自己的 VPS，或指向角落里的一台机器——工作流始终不变，服务器永远属于你。",
    body: [
      "通过 SSH 连接添加一台服务器，它即刻成为一等部署目标：构建、路由、日志、回滚与指标，都与托管云端完全一致。没有锁定，也不必为每个环境单独准备工具。",
      "从一台机器起步，逐步扩展到多台。随着机器增加，Openship 将它们视为可以整体交付的一个机群——因此从单个家庭实验室节点迁移到生产集群，只是规模的变化，而非重写。",
    ],
    highlights: [
      { title: "自带服务器", desc: "任何通过 SSH 连接的 Linux 机器都能成为目标——云 VPS、独立服务器或家庭实验室。" },
      { title: "处处一致", desc: "托管云与自托管使用相同的构建、路由与回滚流水线。" },
      { title: "不被锁定", desc: "你的数据与工作负载都在自己的基础设施上，随时可以离开。" },
    ],
  },
  {
    slug: "push-to-deploy",
    title: "推送即部署",
    category: "部署",
    tagline: "连接仓库——每次推送都会构建、测试并交付。",
    icon: GitBranch,
    screenshot: null,
    summary:
      "关联 GitHub 仓库后，每次推送都会变成一次部署。托管云端由 GitHub App 原生打通；自托管则替你注册好 Webhook（网络回调）——无需 YAML，也无需维护 CI。",
    body: [
      "部署分支上的每次提交都会构建项目、执行你的命令并以零停机方式上线。每个拉取请求都有独立的预览环境和可分享的 URL，分支合并后自动销毁。",
      "想从别处触发部署？入站 Webhook 为任何 CI 系统、定时任务或脚本提供按需重新部署的签名 URL——同一条流水线，按你的方式触发。",
    ],
    highlights: [
      { title: "预览环境", desc: "每个拉取请求一个可访问的 URL，合并后自动清理。" },
      { title: "原生或 Webhook", desc: "云端用 GitHub App；自托管自动注册 Webhook。" },
      { title: "分支环境", desc: "把分支映射到生产、预发或临时预览。" },
    ],
  },
  {
    slug: "any-stack",
    title: "任意语言，任意技术栈",
    category: "部署",
    tagline: "Node, Python, Go, Rust, PHP, Ruby, Java, .NET, Docker, monorepos.",
    icon: Boxes,
    screenshot: null,
    summary:
      "Openship 自动识别你的框架、语言、包管理器和命令——然后构建并运行。Node.js 与 Docker 目前完全原生支持；其他技术栈通过通用流水线配合你自己的命令部署。",
    body: [
      "对 JavaScript/TypeScript 以及任何 Dockerfile 或 Compose 文件，无需任何配置：关联仓库即可交付。对 Go、Rust、Python、Ruby、PHP、Java/Kotlin、.NET 和 Elixir，提供你的安装/构建/启动命令（或一个 Dockerfile），即可用同样的方式部署——各技术栈的原生识别正在逐一上线。",
      "Monorepo 是一等公民：把每个服务指向各自的子目录，并在整个工作区内共享构建缓存。",
    ],
    highlights: [
      { title: "自动识别", desc: "从你的仓库推断框架、包管理器和命令。" },
      { title: "Docker 原生", desc: "任何 Dockerfile 或 Compose 技术栈原样运行，无需转换。" },
      { title: "Monorepo 感知", desc: "一个仓库多个服务，各自拥有独立根目录。" },
    ],
  },
  {
    slug: "compose-multi-service",
    title: "Compose 与多服务",
    category: "部署",
    tagline: "把整套技术栈——应用、worker、数据库——作为一个项目交付。",
    icon: Layers,
    screenshot: "/compose.png",
    summary:
      "带来一份 docker-compose 文件，Openship 会把每个服务部署为一个托管的、走私有网络的项目——应用、worker、队列、数据库——作为一个整体协同。",
    body: [
      "每个服务都有各自的构建、日志、健康检查和扩缩容，同时通过没有暴露端口的私有网络相互通信。部分失败的部署会停下来等你决策，而不是让整套栈处于半更新状态。",
      "可以单独添加、移除或重启某个服务，无需重新部署整个项目——其余服务持续承载流量。",
    ],
    highlights: [
      { title: "Compose 原生", desc: "你现有的 docker-compose 文件就是唯一事实来源。" },
      { title: "按服务控制", desc: "独立的日志、环境变量、扩缩容与重启。" },
      { title: "安全上线", desc: "部分失败时暂停，由你决定保留还是回滚。" },
    ],
  },
  {
    slug: "instant-rollbacks",
    title: "即时回滚",
    category: "部署",
    tagline: "每次部署都是不可变快照，一键即可回退。",
    icon: Undo2,
    screenshot: null,
    summary:
      "每次部署都会捕获为不可变快照，回退因此即时而安全——选定任意历史版本，即可零停机重新上线。",
    body: [
      "按项目自行选择构建产物的保留深度。快照回滚会精确还原当时的构建镜像与工作区；Git 回滚则在上一个提交处重新克隆并构建——速度与磁盘占用之间的取舍由你决定。",
      "回滚本质上就是对已知良好版本的又一次部署，因此走的是与任何发布相同的健康检查、零停机路径。",
    ],
    highlights: [
      { title: "不可变快照", desc: "每个发布都按交付时的原样保存。" },
      { title: "一键回退", desc: "即时恢复任意保留版本，无需重新构建。" },
      { title: "可调保留策略", desc: "每个项目想保留多少历史版本都可以。" },
    ],
  },
  // ── Run ─────────────────────────────────────────────────────────────────
  {
    slug: "logs-monitoring",
    title: "实时日志与监控",
    category: "运行",
    tagline: "跨所有服务的流式日志与实时指标。",
    icon: ScrollText,
    screenshot: null,
    summary:
      "跨服务与副本实时跟踪日志，实时查看 CPU、内存、网络与磁盘——在控制台、CLI 或桌面应用中均可。",
    body: [
      "日志实时流出，支持搜索与过滤，并且持久保存，事故过后也能回溯。请求日志会呈现每条路由的状态码、延迟与路径。",
      "指标实时更新，并按服务绘制图表，部署一落地就能看到它的影响。",
    ],
    highlights: [
      { title: "实时跟踪", desc: "跨服务与副本跟踪 stdout，可过滤、可搜索。" },
      { title: "请求日志", desc: "每个入站请求的状态、延迟与路径。" },
      { title: "实时指标", desc: "CPU、内存、网络与磁盘，按服务绘制图表。" },
    ],
  },
  {
    slug: "jobs-triggers",
    title: "任务与触发器",
    category: "运行",
    tagline: "类 cron 任务与 Webhook 触发的动作，均带实时日志。",
    icon: CalendarClock,
    screenshot: null,
    summary:
      "运行计划任务或按需任务，每次运行都有日志与历史记录——当 Openship 之外发生事件时，还可以通过入站 Webhook 触发部署或任务。",
    body: [
      "任务可以按 cron 计划运行、在指定时间运行一次，或用“立即运行”按钮手动执行，输出实时流出。每次运行连同日志都会留档，便于日后检查。",
      "入站 Webhook 把任何外部事件变成动作：每个钩子都是一个签名 URL，带有自己的令牌或 HMAC，可重新部署项目或运行任务。",
    ],
    highlights: [
      { title: "计划与手动", desc: "cron 计划、单次或立即运行——输出实时流出。" },
      { title: "逐次运行历史", desc: "每次运行的日志与结果都会保留并可搜索。" },
      { title: "Webhook 触发器", desc: "签名 URL（令牌/HMAC），按需部署或运行任务。" },
    ],
  },
  {
    slug: "autoscaling-load-balancing",
    title: "扩缩容与负载均衡",
    category: "运行",
    tagline: "带健康检查与加权路由的零停机发布。",
    icon: Scale,
    screenshot: null,
    summary:
      "借助内置健康检查与加权路由，把流量分发到健康实例上，发布新版本时不丢一个请求。",
    body: [
      "滚动重启与连接排空让零停机部署成为默认。随着集群能力成熟，按服务横向扩缩容——流量上来就扩容，空闲时就缩容——也将进入同一个一键操作界面。",
      "当你想要比一次性切换更多的控制时，加权路由让你在版本或节点之间逐步迁移流量。",
    ],
    highlights: [
      { title: "零停机", desc: "每次部署都执行带连接排空的滚动重启。" },
      { title: "健康检查", desc: "不健康的实例会被自动移出轮转。" },
      { title: "加权路由", desc: "在版本或节点之间逐步迁移流量。" },
    ],
  },
  // ── Connect ─────────────────────────────────────────────────────────────
  {
    slug: "domains-ssl",
    title: "域名与 SSL",
    category: "连接",
    tagline: "不限量的自定义域名、泛域名证书、自动续期。",
    icon: Globe,
    screenshot: null,
    summary:
      "随心添加自定义域名，自动签发 Let's Encrypt 证书——包括泛域名——并自动续期。没有附加组件，没有上限，也没有按域名计量。",
    body: [
      "指向一个域名，几秒内完成验证，Openship 会替你开通并续期证书。设置主域名、添加重定向、可视化管理解析记录。",
      "路由失败绝不会导致部署失败——构建照常交付，域名问题单独呈现，DNS 抽风也拦不住发布。",
    ],
    highlights: [
      { title: "域名不限量", desc: "根域与子域名，均不按域名收费。" },
      { title: "SSL 自动化", desc: "Let's Encrypt，支持泛域名并自动续期。" },
      { title: "可视化 DNS", desc: "解析记录与验证，生效状态一目了然。" },
    ],
  },
  {
    slug: "private-networking",
    title: "私有网络",
    category: "连接",
    tagline: "服务经隔离网络互访——不暴露任何端口。",
    icon: Cable,
    screenshot: null,
    summary:
      "项目内的服务通过私有网络互访，数据库与内部 API 无需公开端口。一个应用与另一个应用之间，一次接线即成可用连接。",
    body: [
      "“在项目中使用”会把数据库或服务的连接信息作为机密环境变量注入另一个项目——内部走共享网络，需要公网可达时则走已发布的主机与端口。",
      "只有你选择暴露的内容才有公网路由，其余默认保持私有。",
    ],
    highlights: [
      { title: "不暴露端口", desc: "内部服务不接触公共互联网。" },
      { title: "一键接线", desc: "把数据库/服务连接作为环境变量注入另一个项目。" },
      { title: "默认私有", desc: "只暴露你明确发布的路由。" },
    ],
  },
  {
    slug: "route-rules-waf",
    title: "边缘路由规则与 WAF",
    category: "连接",
    tagline: "按路由的速率限制、地区/UA 过滤与封禁——实时生效。",
    icon: ShieldAlert,
    screenshot: null,
    summary:
      "组合按路由的规则——速率限制、地区与 User-Agent 过滤、封禁、防盗链——并在边缘即时生效，无需重载，也没有配置文件。",
    body: [
      "规则作为唯一事实来源存储，并实时推送到边缘，变更即时生效、无需重启。自托管现已可用，托管 WAF 与云端对齐正在推进中。",
      "为每条路由构建策略，并在控制台中编辑——边缘会对接管的每个请求强制执行。",
    ],
    highlights: [
      { title: "按路由策略", desc: "速率限制、地区/UA 过滤、封禁与防盗链。" },
      { title: "实时生效，无需重载", desc: "规则变更在边缘即时生效。" },
      { title: "控制台管理", desc: "没有配置文件——可视地编写与编辑规则。" },
    ],
  },
  // ── Data ────────────────────────────────────────────────────────────────
  {
    slug: "managed-databases",
    title: "托管数据库",
    category: "数据",
    tagline: "Postgres、Redis、MongoDB、MySQL——开通即用，自动备份。",
    icon: Database,
    screenshot: null,
    summary:
      "一键拉起 PostgreSQL、Redis、MongoDB 或 MySQL——自动开通、私有网络互联，并按你控制的计划备份。",
    body: [
      "数据库自带计划备份与恢复，通过私有网络一步接线即可连入你的应用。对象存储（兼容 S3）补全了有状态服务的版图。",
      "备份到你自己的目标——S3、SFTP 或其他——支持保留策略与 Webhook 触发执行。",
    ],
    highlights: [
      { title: "一键开通", desc: "Postgres、Redis、MongoDB、MySQL 与对象存储。" },
      { title: "计划备份", desc: "自动备份 + 恢复到你自己的目标。" },
      { title: "私有接线", desc: "经内部网络把数据库接入任意项目。" },
    ],
  },
  {
    slug: "mail",
    title: "邮件服务器与投递",
    category: "数据",
    tagline: "自托管邮件，或经 Amazon SES / SMTP 中继。",
    icon: Mail,
    screenshot: "/email-preview.png",
    summary:
      "用自己的域名发信，认证链自动配好——或接入 Amazon SES 或任意 SMTP 中继，在 Openship 中统一管理发件人、域名与送达率。",
    body: [
      "开通一整套邮件栈并自带网页邮箱客户端；或收信保持自托管，外发经 SES 或 SMTP 中继以保障送达率。一套设置驱动所有系统邮件——密码重置、邀请、验证与通知。",
      "SPF、DKIM 与 DMARC 都替你接好，来自你域名的邮件会落到它该去的地方。",
    ],
    highlights: [
      { title: "自托管或中继", desc: "完整邮件栈，或 SES/SMTP 外发中继——由你选择。" },
      { title: "认证自动配置", desc: "为你的域名配好 SPF、DKIM 与 DMARC。" },
      { title: "自带网页邮箱", desc: "为开通的邮件栈配备的简洁内置客户端。" },
    ],
  },
  // ── Manage ──────────────────────────────────────────────────────────────
  {
    slug: "dashboard-cli-desktop",
    title: "控制台、CLI 与桌面端",
    category: "管理",
    tagline: "从浏览器、单个二进制或原生应用部署。",
    icon: LayoutDashboard,
    screenshot: "/screen.png",
    summary:
      "用流畅的 Web 控制台、单二进制 CLI 或原生 Mac/Windows 桌面应用驱动一切——部署、日志、机密、域名与回滚，尽在一处。",
    body: [
      "控制台覆盖可视化部署、指标、团队访问与计费。CLI 把同样的能力装进单个二进制，方便脚本与 CI。桌面应用从你的机器直接推送，并以原生方式流式呈现日志。",
      "机密静态加密并按环境隔离；每个动作都记录在可导出的审计日志中。",
    ],
    highlights: [
      { title: "三种形态", desc: "Web 控制台、单二进制 CLI 与原生桌面应用。" },
      { title: "机密保管库", desc: "加密存储、按环境隔离，轮换无需重新部署。" },
      { title: "审计日志", desc: "记录每个动作，可导出用于合规。" },
    ],
  },
  {
    slug: "ai-mcp",
    title: "AI 与 MCP",
    category: "管理",
    tagline: "用 Claude、Cursor 或任意 MCP 客户端驱动部署。",
    icon: Bot,
    screenshot: null,
    summary:
      "Openship 内置 MCP 服务器，AI 代理因此可以部署、读日志、管理域名等——通过标准的、经认证的工具，权限严格限定在你允许的范围内。",
    body: [
      "连接 Claude、Cursor 或任意 MCP 客户端，让它以与人类相同的权限模型操作你的基础设施——包括“只能操作它自己创建的项目”这样的窄授权。",
      "每个代理动作都走与控制台和 CLI 相同的授权与审计路径，AI 的访问因此强大，却不会成为后门。",
    ],
    highlights: [
      { title: "标准 MCP", desc: "兼容任何 MCP 客户端——Claude、Cursor 等。" },
      { title: "限定范围的令牌", desc: "只授予代理你选择的项目与动作。" },
      { title: "全程审计", desc: "代理动作走与其他一切相同的授权 + 审计路径。" },
    ],
  },
];

export function getFeature(slug: string): Feature | undefined {
  return FEATURES.find((f) => f.slug === slug);
}

export function relatedFeatures(feature: Feature, count = 3): Feature[] {
  const sameCat = FEATURES.filter((f) => f.category === feature.category && f.slug !== feature.slug);
  const others = FEATURES.filter((f) => f.category !== feature.category && f.slug !== feature.slug);
  return [...sameCat, ...others].slice(0, count);
}
