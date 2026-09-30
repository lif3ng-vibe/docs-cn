import {
  GitCommitVertical, Eye, Terminal, Boxes, Wand2, Undo2,
  TrendingUp, Scale, Activity, ScrollText, CalendarClock, RefreshCw,
  Globe, Lock, Network, Waypoints, Cable, Zap,
  Database, Layers, Server, HardDrive, Mail, Cloudy,
  LayoutDashboard, Monitor, Bot, KeyRound, FileText,
  Shield, Gauge, FileLock2, ShieldAlert, Fingerprint, BadgeCheck,
  Building2, UserCog, KeySquare, Mailbox, ClipboardList, ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { DarkSection } from "./dark-section";

/**
 * Complete platform - dark section, alternating with the light Features
 * section above. Six capability groups with big numbered anchors and an
 * abstract category mark composed of exactly six elements (matching the
 * six items in that group).
 */

type Item = { name: string; desc: string; icon: LucideIcon };
type Group = { n: string; heading: string; mark: React.ReactNode; items: Item[] };

/* ─── Category marks - each contains exactly 6 elements ─────────
 * Refined line-art for the dark surface. Generous viewBox margins,
 * consistent visual weight across all six categories. Color comes
 * from the .cp-group-mark class - a soft lavender, not raw white.
 */
const MARKS = {
  /* Deploy - 6 dots on a smooth ascending bezier (trajectory) */
  deploy: (
    <>
      <path d="M14 82 Q34 76 50 56 T86 18" opacity="0.7" />
      <circle cx="14" cy="82" r="2.1" />
      <circle cx="28" cy="76" r="2.1" />
      <circle cx="42" cy="66" r="2.1" />
      <circle cx="56" cy="52" r="2.1" />
      <circle cx="70" cy="35" r="2.1" />
      <circle cx="86" cy="18" r="2.6" fill="currentColor" />
    </>
  ),
  /* Run - 6 vertical bars on a baseline with caps (activity) */
  run: (
    <>
      <path d="M12 82 L88 82" opacity="0.55" />
      <path d="M20 82 L20 52" strokeLinecap="round" />
      <path d="M32 82 L32 38" strokeLinecap="round" />
      <path d="M44 82 L44 60" strokeLinecap="round" />
      <path d="M56 82 L56 28" strokeLinecap="round" />
      <path d="M68 82 L68 46" strokeLinecap="round" />
      <path d="M80 82 L80 22" strokeLinecap="round" />
    </>
  ),
  /* Connect - hub + 5 nodes arranged on a pentagon (network) */
  connect: (
    <>
      <path d="M50 50 L50 18" opacity="0.55" />
      <path d="M50 50 L80 32" opacity="0.55" />
      <path d="M50 50 L72 80" opacity="0.55" />
      <path d="M50 50 L28 80" opacity="0.55" />
      <path d="M50 50 L20 32" opacity="0.55" />
      <circle cx="50" cy="50" r="3.2" fill="currentColor" />
      <circle cx="50" cy="18" r="2.4" />
      <circle cx="80" cy="32" r="2.4" />
      <circle cx="72" cy="80" r="2.4" />
      <circle cx="28" cy="80" r="2.4" />
      <circle cx="20" cy="32" r="2.4" />
    </>
  ),
  /* Services - 6 stacked layers with subtle isometric step (containers) */
  services: (
    <>
      <rect x="22" y="14" width="56" height="8" rx="1.5" />
      <rect x="18" y="26" width="64" height="8" rx="1.5" />
      <rect x="14" y="38" width="72" height="8" rx="1.5" />
      <rect x="14" y="50" width="72" height="8" rx="1.5" />
      <rect x="14" y="62" width="72" height="8" rx="1.5" />
      <rect x="14" y="74" width="72" height="8" rx="1.5" />
    </>
  ),
  /* Manage - 6 list rows with toggle handles (control surfaces) */
  manage: (
    <>
      <path d="M14 18 L62 18" opacity="0.7" />
      <circle cx="80" cy="18" r="2.6" fill="currentColor" />
      <path d="M14 32 L62 32" opacity="0.7" />
      <circle cx="80" cy="32" r="2.6" />
      <path d="M14 46 L62 46" opacity="0.7" />
      <circle cx="80" cy="46" r="2.6" fill="currentColor" />
      <path d="M14 60 L62 60" opacity="0.7" />
      <circle cx="80" cy="60" r="2.6" />
      <path d="M14 74 L62 74" opacity="0.7" />
      <circle cx="80" cy="74" r="2.6" fill="currentColor" />
      <path d="M14 88 L62 88" opacity="0.7" />
      <circle cx="80" cy="88" r="2.6" />
    </>
  ),
  /* Secure - hexagon (6 sides) with inner check (shield) */
  secure: (
    <>
      <path d="M50 12 L82 30 L82 70 L50 88 L18 70 L18 30 Z" />
      <circle cx="50" cy="12" r="1.8" fill="currentColor" />
      <circle cx="82" cy="30" r="1.8" fill="currentColor" />
      <circle cx="82" cy="70" r="1.8" fill="currentColor" />
      <circle cx="50" cy="88" r="1.8" fill="currentColor" />
      <circle cx="18" cy="70" r="1.8" fill="currentColor" />
      <circle cx="18" cy="30" r="1.8" fill="currentColor" />
      <path d="M40 50 L48 58 L62 42" opacity="0.55" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  /* Collaborate - org tree: 1 owner → 2 → 3 (team hierarchy) */
  team: (
    <>
      <path d="M50 20 L30 46" opacity="0.55" />
      <path d="M50 20 L70 46" opacity="0.55" />
      <path d="M30 54 L20 78" opacity="0.55" />
      <path d="M30 54 L40 78" opacity="0.55" />
      <path d="M70 54 L80 78" opacity="0.55" />
      <circle cx="50" cy="16" r="3.2" fill="currentColor" />
      <circle cx="30" cy="50" r="2.6" />
      <circle cx="70" cy="50" r="2.6" />
      <circle cx="20" cy="82" r="2.2" />
      <circle cx="40" cy="82" r="2.2" />
      <circle cx="80" cy="82" r="2.2" />
    </>
  ),
};

const GROUPS: Group[] = [
  {
    n: "01",
    heading: "部署",
    mark: MARKS.deploy,
    items: [
      { name: "推送即部署", desc: "每次提交都会自动构建并交付，分支环境也一并支持。", icon: GitCommitVertical },
      { name: "预览部署", desc: "每个 Pull Request 都有独立 URL，合并后自动拆除。", icon: Eye },
      { name: "本地构建", desc: "构建跑在你自己的机器上，生产服务器专注于服务。", icon: Terminal },
      { name: "自动识别技术栈", desc: "框架、语言、包管理器、构建命令，统统自动搞定。", icon: Boxes },
      { name: "智能修复", desc: "常见故障（缺失导入、版本漂移）自动诊断并修补。", icon: Wand2 },
      { name: "即时回滚", desc: "每次部署均不可变，一键回退到任意版本。", icon: Undo2 },
    ],
  },
  {
    n: "02",
    heading: "运行",
    mark: MARKS.run,
    items: [
      { name: "自动扩缩容", desc: "按服务横向扩缩容：流量上来就扩，空闲下来就缩。", icon: TrendingUp },
      { name: "负载均衡", desc: "健康检查、加权路由、会话保持，全部内置。", icon: Scale },
      { name: "实时监控", desc: "CPU、内存、网络、磁盘——实时图表与告警。", icon: Activity },
      { name: "流式日志", desc: "跨服务、跨副本实时追踪，支持搜索、过滤与持久化。", icon: ScrollText },
      { name: "定时任务", desc: "类 cron 任务，自带重试、可见性与每次运行的日志。", icon: CalendarClock },
      { name: "零停机部署", desc: "滚动重启、蓝绿发布、连接排空——全自动完成。", icon: RefreshCw },
    ],
  },
  {
    n: "03",
    heading: "连接",
    mark: MARKS.connect,
    items: [
      { name: "自定义域名", desc: "顶级域名与子域名数量不限，支持泛域名。", icon: Globe },
      { name: "免费 SSL", desc: "默认使用 Let's Encrypt，泛域名证书自动续期。", icon: Lock },
      { name: "DNS 管理", desc: "可视化记录与传播状态，域名验证几秒搞定。", icon: Network },
      { name: "边缘路由", desc: "全球边缘节点、Anycast IP、低延迟路由。", icon: Waypoints },
      { name: "私有网络", desc: "服务间通过隔离网络通信，不暴露任何端口。", icon: Cable },
      { name: "WebSocket", desc: "一等公民支持：持久连接、会话保持路由。", icon: Zap },
    ],
  },
  {
    n: "04",
    heading: "服务",
    mark: MARKS.services,
    items: [
      { name: "PostgreSQL", desc: "支持 14–17 版本，每日备份、PITR、定时升级。", icon: Database },
      { name: "Redis", desc: "缓存或持久化皆可，支持集群模式、Pub/Sub 与 Streams。", icon: Layers },
      { name: "MongoDB 与 MySQL", desc: "副本集、分片、自动升级，附迁移工具。", icon: Server },
      { name: "对象存储", desc: "S3 兼容存储桶，支持签名 URL、生命周期规则与复制。", icon: HardDrive },
      { name: "邮件服务器", desc: "用你自己的域名发事务邮件，认证链自动配置。", icon: Mail },
      { name: "CDN", desc: "静态资源加速，部署时自动刷新缓存。", icon: Cloudy },
    ],
  },
  {
    n: "05",
    heading: "管理",
    mark: MARKS.manage,
    items: [
      { name: "CLI", desc: "单个二进制搞定部署、日志、密钥、域名与回滚。", icon: Terminal },
      { name: "Web 控制台", desc: "可视化部署、指标、计费与团队权限。", icon: LayoutDashboard },
      { name: "桌面应用", desc: "Mac 与 Windows 原生客户端，本地推送、原生查看日志。", icon: Monitor },
      { name: "MCP 服务器", desc: "让 AI 智能体驱动部署——Claude、Cursor 等任意 MCP 客户端，标准工具、带鉴权。", icon: Bot },
      { name: "密钥保险库", desc: "静态加密、按环境隔离，轮换无需重新部署。", icon: KeyRound },
      { name: "审计日志", desc: "记录每个操作，可导出，满足合规留存要求。", icon: FileText },
    ],
  },
  {
    n: "06",
    heading: "安全",
    mark: MARKS.secure,
    items: [
      { name: "防火墙", desc: "入站流量默认拒绝，按服务配置策略。", icon: Shield },
      { name: "速率限制", desc: "按路由设限，基于 IP 或令牌，覆盖突发与持续流量。", icon: Gauge },
      { name: "安全响应头", desc: "HSTS、CSP、COOP、COEP——开箱即用的生产默认值。", icon: FileLock2 },
      { name: "DDoS 防护", desc: "边缘层缓解攻击，自动发起质询。", icon: ShieldAlert },
      { name: "加密", desc: "全程 TLS，备份加密，密钥加密。", icon: Fingerprint },
      { name: "合规就绪", desc: "日志与配置满足 SOC 2、ISO 27001 审计要求。", icon: BadgeCheck },
    ],
  },
  {
    n: "07",
    heading: "协作",
    mark: MARKS.team,
    items: [
      { name: "工作区", desc: "每个账号可建多个组织——项目、服务器、成员相互隔离，一键切换。", icon: Building2 },
      { name: "团队角色", desc: "所有者、管理员、成员与受限角色，逐人指派。", icon: UserCog },
      { name: "细粒度资源权限", desc: "权限可精确到单个项目和资源，而不只是粗放的角色。", icon: KeySquare },
      { name: "默认最小权限", desc: "受限角色初始零权限，每项权限都需显式授予——最小权限原则。", icon: ShieldCheck },
      { name: "邀请机制", desc: "邮件邀请队友，链接带有效期，支持接受流程与按邀请人限速。", icon: Mailbox },
      { name: "成员审计", desc: "加入、角色变更、移除全部留痕，可随时导出。", icon: ClipboardList },
    ],
  },
];

export function CompletePlatform() {
  return (
    <section className="cp-outer">
      <DarkSection>
        <div className="cp-container">
          <header className="cp-head">
            <p className="cp-eyebrow">完整平台</p>
            <h2 className="cp-title">
              42 项能力，<br />一个平台。
            </h2>
            <p className="cp-sub">
              没有附加组件商店，没有插件市场，也没有&ldquo;需要先集成&hellip;&rdquo;。
            </p>
          </header>

          <div className="cp-stack">
            {GROUPS.map((g) => (
              <section key={g.n} className="cp-group">
                <div className="cp-group-rail">
                  <span className="cp-group-n">{g.n}</span>
                  <h3 className="cp-group-heading">{g.heading}</h3>

                  <svg
                    className="cp-group-mark"
                    viewBox="0 0 100 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {g.mark}
                  </svg>

                  <span className="cp-group-count">
                    <span className="cp-group-count-n">{g.items.length}</span>
                    <span className="cp-group-count-label">项能力</span>
                  </span>
                </div>
                <div className="cp-grid">
                  {g.items.map((it) => {
                    const Icon = it.icon;
                    return (
                      <article key={it.name} className="cp-item">
                        <div className="cp-item-head">
                          <Icon
                            className="cp-item-icon"
                            strokeWidth={1.75}
                            aria-hidden="true"
                          />
                          <h4 className="cp-item-name">{it.name}</h4>
                        </div>
                        <p className="cp-item-desc">{it.desc}</p>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </DarkSection>
    </section>
  );
}
