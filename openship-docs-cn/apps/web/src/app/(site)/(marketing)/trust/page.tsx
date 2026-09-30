import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import {
  Database,
  ShieldCheck,
  Split,
  KeyRound,
  Server,
  Github,
} from "lucide-react";

export const metadata: Metadata = {
  title: "信任与安全 – Openship",
  description:
    "Openship 如何处理你的数据与权限，以及自托管实例与 Openship Cloud 之间的边界。",
};

type Pillar = {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
};

const PILLARS: Pillar[] = [
  {
    title: "数据归属",
    desc: "本地与服务器项目只存在于你实例的数据库中。云项目以 Openship Cloud 为准。一份资源要么完全在本地，要么完全在云端——绝不拆分。",
    icon: Database,
    href: "/docs/architecture/data-ownership",
  },
  {
    title: "权限模型",
    desc: "每个请求都经过同一个权限面——角色加资源授权。被拒绝的访问一律返回 404，绝不会确认你看不到的资源的存在。",
    icon: ShieldCheck,
    href: "/docs/security/permissions",
  },
  {
    title: "本地与云端的边界",
    desc: "单一网关，单一所有者身份。代理请求不转发本地 cookie 或组织 ID，也没有混合形态——本地 Bug 触及不到云端数据。",
    icon: Split,
    href: "/docs/security/cloud-boundary",
  },
  {
    title: "凭据保管",
    desc: "GitHub App 密钥只存放在 Openship Cloud 上；自托管实例通过它签发令牌。云端会话与密钥静态加密存储，绝不会暴露给浏览器。",
    icon: KeyRound,
    href: "/docs/security/auth",
  },
  {
    title: "自托管或云端",
    desc: "把 Openship 完全跑在自己的基础设施上，数据不出你的网络；或在需要托管算力时接入 Openship Cloud。每个项目都由你选择。",
    icon: Server,
    href: "/docs/architecture/overview",
  },
  {
    title: "开源且可审计",
    desc: "Openship 以 Apache 2.0 许可开源。安全边界、权限面与网关全部公开，供你审阅。",
    icon: Github,
    href: "https://github.com/oblien/openship",
  },
];

export default function TrustPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
          style={{
            background:
              "radial-gradient(55% 75% at 50% -10%, var(--th-aurora-violet-mid), transparent 70%)," +
              "radial-gradient(40% 60% at 82% 0%, var(--th-aurora-lavender), transparent 70%)",
          }}
        />

        <section className="mx-auto max-w-6xl px-6 pb-16 pt-28 sm:pt-32">
          <div className="max-w-2xl">
            <span className="th-text-secondary text-[13px] font-medium uppercase tracking-[0.14em]">
              信任与安全
            </span>
            <h1 className="th-text-heading mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              为承载生产环境而生
            </h1>
            <p className="th-text-body mt-5 max-w-xl text-lg leading-relaxed">
              你的数据存在哪里、谁能触达、自托管实例如何与云端通信——Openship
              对这些毫不含糊。这里是简版，文档里有更深入的说明。
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map(({ title, desc, icon: Icon, href }) => {
              const inner = (
                <>
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background: "var(--th-clr-plum-bg)",
                      color: "var(--th-clr-plum)",
                    }}
                  >
                    <Icon className="h-[22px] w-[22px]" />
                  </div>
                  <h3 className="th-text-title mt-5 text-[17px] font-semibold tracking-[-0.01em]">
                    {title}
                  </h3>
                  <p className="th-text-secondary mt-2 text-sm leading-relaxed">
                    {desc}
                  </p>
                </>
              );
              const cls =
                "flex flex-col rounded-2xl border p-6 transition-all";
              const style = {
                background: "var(--th-card-bg)",
                borderColor: "var(--th-card-bd)",
                boxShadow: "var(--th-card-shadow)",
              } as const;
              return href ? (
                <Link key={title} href={href} className={cls} style={style}>
                  {inner}
                </Link>
              ) : (
                <div key={title} className={cls} style={style}>
                  {inner}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Compliance intent (factual, no invented certs) ──────── */}
        <section className="mx-auto max-w-3xl px-6 pb-28">
          <div
            className="rounded-2xl border p-8"
            style={{
              background: "var(--th-bg-subtle)",
              borderColor: "var(--th-bd-subtle)",
            }}
          >
            <h2 className="th-text-heading text-xl font-semibold tracking-[-0.01em]">
              合规与漏洞披露
            </h2>
            <p className="th-text-body mt-3 text-[15px] leading-relaxed">
              Openship 开源，安全模型任何人皆可审计。若有最严格的要求，自托管
              能让所有项目数据与网络流量都留在你自己的基础设施内。我们正在
              积极推进正式认证；本页如实反映平台当前的安全状况。
            </p>
            <p className="th-text-body mt-3 text-[15px] leading-relaxed">
              发现了漏洞？请私下报告至{" "}
              <a
                href="mailto:security@oblien.com"
                className="font-medium underline underline-offset-2"
                style={{ color: "var(--th-clr-plum)" }}
              >
                security@oblien.com
              </a>
              。
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
