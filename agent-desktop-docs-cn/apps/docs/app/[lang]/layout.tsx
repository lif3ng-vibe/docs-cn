import "../global.css";
import { cn } from "@vercel/geistdocs/utils";
import "@/lib/geistdocs/site-url-warning";
import { Footer } from "@vercel/geistdocs/footer";
import { GeistdocsThemeScript } from "@vercel/geistdocs/layout";
import { Navbar } from "@vercel/geistdocs/navbar";
import type { Metadata } from "next";
import { GeistdocsProvider } from "@/components/geistdocs/provider";
import { config } from "@/lib/geistdocs/config";
import { withBase } from "@/lib/base-path";
import { mono, sans } from "@/lib/geistdocs/fonts";
import { getRootLang } from "@/lib/geistdocs/root-params";
import { siteUrl } from "@/lib/geistdocs/site-url";

// 纯中文单语镜像：root param 只枚举 'cn'（geistdocs 的中文 locale 键，
// 不出现在 URL 中）；<html lang> 映射回标准的 zh-CN。
export const generateStaticParams = () => [{ lang: "cn" }];

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "agent-desktop | AI 智能体桌面自动化",
    template: "%s | agent-desktop",
  },
  description: "面向 AI 智能体的桌面自动化 CLI",
  icons: { icon: withBase("/desktop/favicon.ico") },
};

const Layout = async ({ children }: LayoutProps<"/[lang]">) => {
  const lang = await getRootLang();

  return (
    <html
      className={cn(sans.variable, mono.variable, "antialiased")}
      lang={lang === "cn" ? "zh-CN" : lang}
      suppressHydrationWarning
    >
      <head>
        <GeistdocsThemeScript />
      </head>
      <body style={{ backgroundColor: "var(--ds-background-200)" }}>
        <GeistdocsProvider basePath={config.basePath} lang={lang}>
          <Navbar config={config} />
          {children}
          <Footer />
        </GeistdocsProvider>
      </body>
    </html>
  );
};

export default Layout;
