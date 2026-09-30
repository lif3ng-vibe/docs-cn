import { Navbar, Footer } from "@/components/landing";
import {
  SELF_HOSTED,
  STANDARD,
  UI,
  chooseLabel,
  cloudFrom,
  priceParts,
  getCloudPricing,
} from "@/lib/pricing";
import { CLOUD_CTA_HREF, SELF_HOST_CTA_HREF, faq } from "./_data";

// Match the public catalog and JSON-LD cache window.
export const revalidate = 60;

function Check() {
  return (
    <svg className="pp-plan-check" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10.5l4 4 8-10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default async function PricingPage() {
  const pricing = await getCloudPricing();
  const from = cloudFrom(pricing);
  const questions = faq(pricing);

  return (
    <>
      <Navbar />
      <main className="pp-root">

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="pp-hero">
          <div className="pp-hero-glow" aria-hidden="true" />
          <div className="pp-container pp-hero-inner">
            <p className="pp-eyebrow">定价</p>
            <h1 className="pp-headline">
              自托管，免费。<br />
              <span className="pp-headline-soft">
                {from ? `Cloud 每月 ${from} 起。` : "自有服务器上，永久免费。"}
              </span>
            </h1>
            <p className="pp-sub">
              Openship 以 Apache 2.0 开源——整个平台可免费跑在任意 Linux 机器上，
              没有计量、没有席位上限，也不用信用卡。或者交给我们来跑：Openship Cloud 全托管
              {from ? `，每月 ${from} 起` : ""}。
            </p>

            <ul className="pp-hero-trust">
              <li>开源 · Apache 2.0</li>
              <li>自托管永久免费</li>
              <li>不被锁定</li>
              {from && <li>Cloud 每月 {from}{UI.perMonth}</li>}
            </ul>
          </div>
        </section>

        {/* ── Self-hosted band ───────────────────────────────── */}
        <section className="pp-selfhost-section">
          <div className="pp-container">
            <div className="pp-selfhost">
              <div>
                <span className="pp-selfhost-tag">开源</span>
                <h2 className="pp-selfhost-name">{SELF_HOSTED.name}</h2>
                <p className="pp-selfhost-lead">{SELF_HOSTED.tagline}</p>

                <div className="pp-selfhost-price">
                  <span className="pp-selfhost-amt">{SELF_HOSTED.priceLabel}</span>
                  <span className="pp-selfhost-note">{SELF_HOSTED.priceNote}</span>
                </div>

                <a href={SELF_HOST_CTA_HREF} className="pp-solid-cta">
                  {SELF_HOSTED.cta}
                </a>
              </div>

              <ul className="pp-selfhost-features">
                {SELF_HOSTED.features.map((f) => (
                  <li key={f}>
                    <Check />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Cloud plans ────────────────────────────────────── */}
        <section className="pp-plans-section">
          <div className="pp-container">
            <header className="pp-plans-head">
              <h2 className="pp-plans-title">Openship Cloud</h2>
              <p className="pp-plans-note">
                托管的构建、应用运行时与 HTTPS 域名。
                为你的组织选择套餐，并在控制台跟踪点数用量。
              </p>

              {!pricing.available && (
                <p role="status">Cloud 当前价格暂时无法获取。请<a href={CLOUD_CTA_HREF}>打开控制台</a>查看可用性。</p>
              )}
            </header>

            <div className="pp-plans">
              {pricing.tiers.map((plan) => {
                const price = priceParts(plan);
                const free = plan.price.monthly === 0;
                return (
                  <article
                    key={plan.id}
                    className={`pp-plan ${plan.popular ? "pp-plan--highlight" : ""}`}
                  >
                    {plan.popular && <span className="pp-plan-ribbon">{UI.mostPopular}</span>}

                    <h3 className="pp-plan-name">{plan.name}</h3>
                    <p className="pp-plan-lead">{plan.description}</p>

                    <div className="pp-plan-price">
                      <span className="pp-plan-amt">
                        {price.amount}
                        {price.per && <span className="pp-plan-per">{price.per}</span>}
                      </span>

                      <span className="pp-plan-pricenote">
                        {free ? "无需信用卡" : UI.billedMonthly}
                      </span>
                    </div>

                    <a
                      href={CLOUD_CTA_HREF}
                      className={`pp-plan-cta ${plan.popular ? "pp-plan-cta--filled" : ""}`}
                    >
                      {free ? UI.ctaStart : chooseLabel(plan.name)}
                    </a>

                    {/* A lead-in, not a bullet — it used to carry a checkmark, which
                        made a sentence ending in a colon read as a feature. */}
                    {plan.inheritedFrom && (
                      <p className="pp-plan-inherits">{plan.inheritedFrom}</p>
                    )}

                    <ul className="pp-plan-features">
                      {plan.features.map((f) => (
                        <li key={f}>
                          <Check />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>

            {/* What every tier includes, stated ONCE.
                A tier's own bullets are its numbers; anything true on all of them
                belongs here instead of repeated down each column — repeating it was
                what made the audit log read as a Scale-only feature. */}
            <div className="pp-standard">
              <h3 className="pp-standard-title">{STANDARD.title}</h3>
              <ul className="pp-standard-features">
                {STANDARD.features.map((f) => (
                  <li key={f}>
                    <Check />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {pricing.customTiers.map((plan) => (
              <div key={plan.id} className="pp-ent">
                <div>
                  <h3 className="pp-ent-name">{plan.name}</h3>
                  <p className="pp-ent-lead">{plan.description}</p>
                  {/* Name → lead → price, the same order as the four tier cards, so
                      the eye finds "how much" in the same place it just left. */}
                  <p className="pp-ent-price">{UI.custom}</p>
                </div>

                <div>
                  {plan.inheritedFrom && (
                    <p className="pp-ent-inherits">{plan.inheritedFrom}</p>
                  )}
                  <ul className="pp-ent-features">
                    {plan.features.map((f) => (
                      <li key={f}>
                        <Check />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a href={plan.contactSales ?? CLOUD_CTA_HREF} className="pp-solid-cta">
                  {UI.ctaContact}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section className="pp-faq-section">
          <div className="pp-container">
            <header className="pp-faq-head">
              <p className="pp-eyebrow">疑问</p>
              <h2 className="pp-faq-title">在此解答。</h2>
            </header>

            <div className="pp-faq-list">
              {questions.map((f) => (
                <details key={f.q} className="pp-faq-item">
                  <summary className="pp-faq-q">
                    <span>{f.q}</span>
                    <span className="pp-faq-icon" aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </summary>
                  <p className="pp-faq-a">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────── */}
        <section className="pp-end">
          <div className="pp-container">
            <div className="pp-end-card">
              <h2 className="pp-end-title">用你的服务器，或我们的。</h2>
              <p className="pp-end-sub">
                自托管免费，在任意 Linux 机器上一条命令即可跑起来。如果你
                更愿意让我们来运行，Openship Cloud 已经上线——免费起步，
                规模超出时再付费。
              </p>
              <div className="pp-end-cta-row">
                <a href={SELF_HOST_CTA_HREF} className="pp-btn pp-btn--primary">
                  {SELF_HOSTED.cta}
                </a>
                <a href={CLOUD_CTA_HREF} className="pp-btn pp-btn--ghost">
                  {UI.ctaStart}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
