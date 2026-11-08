import { defineConfig } from "@vercel/geistdocs/config";
import { BASE_PATH } from "@/lib/base-path";
import {
  ai,
  basePath,
  github,
  Logo,
  nav,
  navbarBrand,
  prompt,
  siteId,
  suggestions,
  title,
  translations,
} from "@/geistdocs";

export const config = defineConfig({
  title,
  agent: { enabled: false },
  // 中文镜像：'cn' 为默认语言（search 路由的中文分词器键），URL 不带前缀。
  defaultLanguage: "cn",
  logo: <Logo />,
  logoHref: "/desktop",
  github,
  nav,
  navbarBrand,
  basePath,
  siteId,
  siteUrl: "https://lif3ng-vibe.github.io/docs-cn/agent-desktop",
  translations,
  webmcp: { enabled: false },
  language: { enabled: false },
  feedback: { enabled: false },
  content: [{ id: "docs", label: "Docs", dir: "content/docs", route: "/desktop" }],
  ai: {
    endpoint: "/desktop/api/chat",
    prompt,
    suggestions,
    ...ai,
  },
});
