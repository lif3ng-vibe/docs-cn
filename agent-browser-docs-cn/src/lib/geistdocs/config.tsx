import { defineConfig } from "@vercel/geistdocs/config";
import type { GeistdocsTranslations } from "@vercel/geistdocs/config";
import { siteUrl } from "@/lib/site";

export const config = defineConfig({
  title: "agent-browser 中文文档",
  siteUrl,
  // 镜像部署在 GitHub Pages 子路径，客户端静态搜索索引按此前缀取数。
  basePath: "/docs-cn/agent-browser",
  defaultLanguage: "cn",
  logo: (
    <span
      className="font-medium tracking-tight"
      style={{ fontFamily: "var(--font-geist-pixel-square)" }}
    >
      agent-browser
    </span>
  ),
  navbarActiveProduct: "agent-browser",
  navbarBrand: "labs",
  // standard 模式不带 Vercel OSS 全家桶 flyout（默认菜单含 Frameworks/SDKs
  // 等 vercel.com 链接，对中文镜像读者是噪音）。
  navbarVariant: "standard",
  github: {
    owner: "vercel-labs",
    repo: "agent-browser",
    branch: "main",
    editPath: "docs/content/docs",
  },
  content: [
    { id: "docs", label: "文档", dir: "content/docs", route: "/" },
  ],
  nav: [
    { label: "文档", href: "/" },
    {
      label: "English",
      href: "https://agent-browser.dev",
      external: true,
    },
    {
      label: "npm",
      href: "https://www.npmjs.com/package/agent-browser",
      external: true,
    },
  ],
  ai: { enabled: false },
  feedback: { enabled: false },
  language: { enabled: false },
  pageActions: { askAI: false, openInChat: false, copyPage: true },
  // WebMCP 的 read_current_page 依赖服务端 markdown 协商（Accept:
  // text/markdown），静态镜像无此服务，关闭注入。
  webmcp: { enabled: false },
  // fumadocs-ui i18n 文案（分页/TOC/搜索弹窗/编辑链接）。geistdocs 的类型
  // 只声明了 displayName/search 两个键，但 defineI18nUI 运行时消费全量键。
  translations: {
    cn: {
      displayName: "简体中文",
      search: "搜索",
      searchNoResult: "未找到结果",
      toc: "本页内容",
      tocNoHeadings: "无标题",
      lastUpdate: "最后更新于",
      chooseLanguage: "选择语言",
      nextPage: "下一页",
      previousPage: "上一页",
      chooseTheme: "主题",
      editOnGithub: "在 GitHub 上编辑",
    },
  } as GeistdocsTranslations,
});
