/**
 * How it works - the deploy mechanism as a five-step flow.
 *
 * This is the differentiator the feature grids only imply: builds run on YOUR
 * machine, ship to YOUR servers over SSH with no agent installed, start as
 * immutable containers, swap with zero downtime, and are drivable from
 * anywhere (CLI / dashboard / desktop / AI agent over MCP).
 */

const STEPS = [
  {
    n: "01",
    title: "连接",
    body: "关联一个 Git 仓库，选好目标——Openship Cloud，或通过 SSH 接入你自己的服务器。你的机器上什么都不用装：没有 agent，没有守护进程，没有控制台。",
  },
  {
    n: "02",
    title: "构建",
    body: "每次推送都会在你的机器（或云端）上构建镜像、运行测试，并打上不可变、可版本追溯的产物标签。生产服务器只专注于对外服务。",
  },
  {
    n: "03",
    title: "交付",
    body: "构建好的镜像通过 SSH 流式传输到目标机器，以全新容器的形式启动在隔离的私有网络中——不暴露端口，无需手写 Docker 或 Compose。",
  },
  {
    n: "04",
    title: "路由",
    body: "你的域名接入 OpenResty 并自动签发 Let's Encrypt SSL 证书，随后流量零停机切换到新容器。旧版本随时待命，可一键回滚。",
  },
  {
    n: "05",
    title: "运维",
    body: "流式查看日志、盯住指标，一键回滚到任意历史版本——CLI、Web 控制台、桌面应用，乃至通过 MCP 接入的 AI 智能体，随你操作。",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="hiw-section">
      <div className="hiw-container">
        <header className="hiw-head">
          <p className="hiw-eyebrow">工作原理</p>
          <h2 className="hiw-title">
            从 git push 到上线，<br />全程跑在你的基础设施上。
          </h2>
          <p className="hiw-sub">
            服务器上不装 agent，也没有黑盒。这里是代码走过的确切路径——以及你的生产机器为何从不参与构建。
          </p>
        </header>

        <ol className="hiw-flow">
          {STEPS.map((s) => (
            <li key={s.n} className="hiw-step">
              <div className="hiw-step-rail">
                <span className="hiw-step-n">{s.n}</span>
              </div>
              <div className="hiw-step-body">
                <h3 className="hiw-step-title">{s.title}</h3>
                <p className="hiw-step-desc">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
