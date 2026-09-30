import { cloudFrom, getCloudPricing, UI } from "@/lib/pricing";

function models(from: string | null) { return [
  {
    n: "01",
    tag: "托管",
    title: "Openship Cloud",
    lead:
      "从你的仓库构建并部署 Web 应用，部署、域名、日志在一个地方统一管理。",
    points: [
      "托管的构建与应用运行时",
      "HTTPS 域名与静态站点托管",
      "在控制台随时查看点数消耗",
    ],
    price: from ? `${from}${UI.perMonth} 起` : "查看 Cloud 套餐",
    priceNote: "支持按月或按年计费",
  },
  {
    n: "02",
    tag: "自托管",
    title: "你自己的服务器",
    lead:
      "在你拥有的机器上运行整个平台。任意 Linux 主机、任意提供商、任意区域，随业务增长随时加节点。",
    points: [
      "接入任意 VPS——Hetzner、DO、AWS、裸金属均可",
      "跨区域多服务器扇出部署",
      "你的机器上不装 agent、不装控制台",
    ],
    price: "免费且开源",
    priceNote: "Apache-2.0 —— 今天就能自托管，无需计费",
    feature: true,
  },
  {
    n: "03",
    tag: "混合",
    title: "自由组合",
    lead:
      "突发流量交给云端，敏感数据留在你的服务器。一个控制面，工作负载随时迁移，无需重建。",
    points: [
      "应用跑在你的服务器，服务跑在云端",
      "或者生产环境在本地，预览环境走托管",
      "一份账单、一个团队、一个控制台",
    ],
    price: "Cloud 套餐 + 你的服务器",
    priceNote: "一份 Cloud 订阅，自托管机器数量不限",
  },
]; }

export async function DeploymentModels() {
  const pricing = await getCloudPricing();
  const MODELS = models(cloudFrom(pricing));
  return (
    <section className="dm-section">
      <div className="dm-container">
        <header className="dm-head">
          <p className="dm-eyebrow">部署在哪</p>
          <h2 className="dm-title">
            云端、自托管，<br />或者两者兼得。
          </h2>
          <p className="dm-sub">
            同一个平台，三种部署形态——随时可以切换。
          </p>
        </header>

        <div className="dm-grid">
          {MODELS.map((m) => (
            <article
              key={m.n}
              className={`dm-panel ${m.feature ? "dm-panel--feature" : ""}`}
            >
              <div className="dm-panel-top">
                <span className="dm-panel-n">{m.n}</span>
                <span className="dm-panel-tag">{m.tag}</span>
              </div>

              <h3 className="dm-panel-title">{m.title}</h3>
              <p className="dm-panel-lead">{m.lead}</p>

              <ul className="dm-panel-points">
                {m.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>

              <div className="dm-panel-foot">
                <span className="dm-panel-price">{m.price}</span>
                <span className="dm-panel-pricenote">{m.priceNote}</span>
              </div>
            </article>
          ))}
        </div>

        {/* ── Migration callout ────────────────────────────────────── */}
        <div className="dm-migrate">
          <div className="dm-migrate-left">
            <span className="dm-migrate-tag">随时迁移</span>
            <h3 className="dm-migrate-title">
              云端{" "}
              <span className="dm-migrate-arrow" aria-hidden="true">⇄</span>
              {" "}自托管。<br />
              <span className="dm-migrate-soft">一次点击，随时切换。</span>
            </h3>
          </div>
          <p className="dm-migrate-body">
            你的应用就是普通容器，服务都是标准镜像。工作负载在 Openship Cloud
            与你自己的服务器之间搬动，无需重建、无需重写，更没有"离场税"。点击、确认、搞定。
          </p>
        </div>
      </div>
    </section>
  );
}
