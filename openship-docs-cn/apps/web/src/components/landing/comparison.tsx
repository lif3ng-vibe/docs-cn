import { Fragment } from "react";

/**
 * Comparison - grouped table, Openship column highlighted with a tinted rail.
 * Each cell carries a refined status mark (win / loss / neutral) so it reads at
 * a glance without bright colors.
 *
 * Two rules this table lives by:
 *
 * 1. ONLY REAL DIFFERENCES. The shared essentials - git deploys, TLS,
 *    databases, backups, multi-server, cron - are deliberately absent. Everyone
 *    has them, and claiming a win on them is the fastest way to lose a reader.
 *    Where a competitor genuinely matches us the cell is `neutral`, never a
 *    manufactured `loss`. Every claim here is verified against Vercel/Netlify
 *    and Coolify/Dokploy/Dokku as of July 2026.
 *
 * 2. SAY IT THE CALM WAY. These capabilities involve Openship touching servers
 *    the reader already runs, so the wording leads with what they get, not with
 *    what we do to their box. "Works with the proxy you already run", never
 *    "take over your proxy"; "picks up what's already running", never "adopt and
 *    take over". Same fact, no implied risk.
 *
 * Order is commercial, not technical: what you're buying into → what comes
 * included → whether it fits what you already run → how you get out.
 */

type Status = "win" | "loss" | "neutral";
type Cell = { text: string; status: Status };
type Row = { feature: string; openship: Cell; managed: Cell; selfhost: Cell };
type Group = { title: string; rows: Row[] };

const GROUPS: Group[] = [
  {
    title: "跑在哪里，哪些东西必须常开",
    rows: [
      {
        feature: "谁来承载你的工作负载",
        openship: {
          text: "交给 Openship Cloud 运行，或在自己机器上免费自托管。一个工具、一个控制台，以后想换方向随时可以。",
          status: "win",
        },
        managed: {
          text: "由平台方托管，跑得也不错——但只有托管一种形态，没有可供你自己部署的版本。",
          status: "neutral",
        },
        selfhost: {
          text: "它们的云上只托管控制面板，每台服务器仍要你自己提供、运行并付费。",
          status: "loss",
        },
      },
      {
        feature: "哪些东西必须一直开机",
        openship: {
          text: "Mac、Windows、Linux 原生应用。控制面只在你打开应用时跑在本机——部署不需要额外养一台机器。",
          status: "win",
        },
        managed: {
          text: "没有桌面应用，一切时刻跑在它们的云上。",
          status: "loss",
        },
        selfhost: {
          text: "没有桌面应用，控制面服务器还得 7×24 小时在线。",
          status: "loss",
        },
      },
      {
        feature: "源代码流经哪里",
        openship: {
          text: "从桌面应用出发，你的文件夹或仓库直达最终运行它的机器。中间没有任何常驻环节扣着你的代码。",
          status: "win",
        },
        managed: {
          text: "上传到它们的云端构建。",
          status: "loss",
        },
        selfhost: {
          text: "先落到一台长期运行的控制面机器——哪怕那台机器是你自己的。",
          status: "loss",
        },
      },
    ],
  },
  {
    title: "开箱自带，而非外挂",
    rows: [
      {
        feature: "用你自己的域名发邮件",
        openship: {
          text: "真正的邮件服务器，开箱即配：邮箱、网页版、SPF/DKIM/DMARC 认证链，还可通过 SES 或你自己的 SMTP 发信。",
          status: "win",
        },
        managed: {
          text: "不提供。需接入 SendGrid、Resend 或 Postmark，按条付费。",
          status: "loss",
        },
        selfhost: {
          text: "没有托管邮件服务——镜像要自己跑，DNS 认证链要自己接。",
          status: "loss",
        },
      },
      {
        feature: "边缘流量规则",
        openship: {
          text: "速率限制、按国家/IP/User-Agent 拦截、防盗链，在控制台按路由设置，即时生效无需重载。",
          status: "win",
        },
        managed: {
          text: "有防火墙和速率限制，但锁在高阶套餐里。",
          status: "neutral",
        },
        selfhost: {
          text: "手写代理配置可以实现；国家规则开箱即无。",
          status: "neutral",
        },
      },
      {
        feature: "谁在访问你的应用",
        openship: {
          text: "按路由的流量、国家分布、实时请求日志，全部内置。",
          status: "win",
        },
        managed: {
          text: "分析看板强大，但按套餐设限或加价。",
          status: "neutral",
        },
        selfhost: {
          text: "不提供——自己另装 Grafana、Plausible 或 ELK 套件。",
          status: "loss",
        },
      },
      {
        feature: "访问控制与审计",
        openship: {
          text: "权限可细到单个项目，新成员从零权限起步，每次变更都有记录可导出——所有套餐通用。",
          status: "win",
        },
        managed: {
          text: "只有粗粒度团队角色；审计追踪与 SSO 属企业套餐。",
          status: "neutral",
        },
        selfhost: {
          text: "仅有粗粒度角色，变更历史几乎没有。",
          status: "loss",
        },
      },
    ],
  },
  {
    title: "兼容你现有的环境",
    rows: [
      {
        feature: "已经跑着东西的服务器",
        openship: {
          text: "指向一台服务器，它就会接管其上已在运行的容器。不重建，也不重启。",
          status: "win",
        },
        managed: {
          text: "无从接管——只能从源码重新部署。",
          status: "loss",
        },
        selfhost: {
          text: "无法收编已在运行的应用，只能逐个手工重建。",
          status: "loss",
        },
      },
      {
        feature: "你已在用的代理",
        openship: {
          text: "沿用你现有的 Traefik、nginx 或 Caddy（:80/:443 端口），且切换一步即可还原。",
          status: "win",
        },
        managed: {
          text: "不适用——边缘是它们的，规则也是它们的。",
          status: "neutral",
        },
        selfhost: {
          text: "安装时就接管代理，并要求独占这些端口。",
          status: "loss",
        },
      },
      {
        feature: "配置跟随仓库",
        openship: {
          text: "openship.json 描述构建、环境变量、域名、服务与资源——像其他代码一样在 Pull Request 中评审。",
          status: "win",
        },
        managed: {
          text: "vercel.json 与 netlify.toml 也能做到。",
          status: "neutral",
        },
        selfhost: {
          text: "有 Procfile 或 compose 文件，但域名、环境变量与资源只能在面板里配。",
          status: "neutral",
        },
      },
    ],
  },
  {
    title: "如果你想反悔",
    rows: [
      {
        feature: "换一台服务器",
        openship: {
          text: "把运行中的应用连同卷和证书迁到另一台机器，验证无误后再切换流量。",
          status: "win",
        },
        managed: {
          text: "不适用——机器由平台指定。",
          status: "neutral",
        },
        selfhost: {
          text: "在新机器上重新部署，卷再手动拷过去。",
          status: "loss",
        },
      },
      {
        feature: "离开 Openship",
        openship: {
          text: "在你自己的服务器上，删除项目只会删掉我们的记录，别无其他。容器、数据和配置继续服务流量，日后 Openship 还能重新接管。",
          status: "win",
        },
        managed: {
          text: "什么都不会留下——工作负载只存在于它们的云里。",
          status: "loss",
        },
        selfhost: {
          text: "删除即拆除应用，事后也无法重新接管运行中的应用。",
          status: "loss",
        },
      },
    ],
  },
];

function StatusMark({ status }: { status: Status }) {
  return (
    <span className={`cmp-mark cmp-mark--${status}`} aria-hidden="true">
      {status === "win" && (
        <svg viewBox="0 0 14 14" fill="none">
          <path d="M3 7.2 L6 10 L11 4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {status === "loss" && (
        <svg viewBox="0 0 14 14" fill="none">
          <path d="M4 4 L10 10 M10 4 L4 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
      {status === "neutral" && (
        <svg viewBox="0 0 14 14" fill="none">
          <path d="M3.5 7 L10.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

export function Comparison() {
  return (
    <section className="cmp-section">
      <div className="cmp-container">
        <header className="cmp-head">
          <p className="cmp-eyebrow">坦诚对比</p>
          <h2 className="cmp-title">
            OpenShip 究竟<br />有何不同。
          </h2>
          <p className="cmp-sub">
            Git 部署、TLS、数据库、备份、定时任务 &mdash; 这里的每个工具都有，所以不列入对比。
            下面列出的，才是真正影响你能力边界、以及反悔成本的差异。
          </p>
        </header>

        <div className="cmp">
          <div className="cmp-highlight" aria-hidden="true" />

          {/* Header */}
          <div className="cmp-row cmp-row--head">
            <div className="cmp-cell cmp-cell--feature">功能</div>
            <div className="cmp-cell cmp-cell--win">Openship</div>
            <div className="cmp-cell">托管（Vercel、Netlify）</div>
            <div className="cmp-cell">自托管（Coolify、Dokploy、Dokku）</div>
          </div>

          {/* Body, grouped */}
          {GROUPS.map((g) => (
            <Fragment key={g.title}>
              <p className="cmp-group">{g.title}</p>
              {g.rows.map((r) => (
                <div key={r.feature} className="cmp-row">
                  <div className="cmp-cell cmp-cell--feature">{r.feature}</div>
                  <div className="cmp-cell cmp-cell--win">
                    <StatusMark status={r.openship.status} />
                    <span>{r.openship.text}</span>
                  </div>
                  <div className="cmp-cell">
                    <StatusMark status={r.managed.status} />
                    <span>{r.managed.text}</span>
                  </div>
                  <div className="cmp-cell">
                    <StatusMark status={r.selfhost.status} />
                    <span>{r.selfhost.text}</span>
                  </div>
                </div>
              ))}
            </Fragment>
          ))}
        </div>

        <p className="cmp-foot">
          对比基于各工具 2026 年 7 月的正式发布版本。"−" 表示该工具确实与
          Openship 相当，或此项对其不适用。我们宁可判为平手，也不乱打叉。
        </p>
      </div>
    </section>
  );
}
