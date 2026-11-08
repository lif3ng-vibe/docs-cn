import type {
  GeistdocsAIConfig,
  GeistdocsNavbarBrand,
} from "@vercel/geistdocs/config";

export const navbarBrand: GeistdocsNavbarBrand = "labs";

export const Logo = () => (
  <span className="font-semibold text-gray-1000 text-lg leading-none tracking-[-3%]">
    agent-desktop
  </span>
);

export const github = {
  branch: "main",
  editPath: "apps/docs/content/docs/{path}",
  owner: "vercel-labs",
  repo: "agent-desktop",
};

export const nav = [
  {
    label: "文档",
    href: "/desktop",
  },
  {
    label: "npm",
    href: "https://www.npmjs.com/package/agent-desktop",
    external: true,
  },
];

export const suggestions = [
  "agent-desktop 如何安装？",
  "agent-desktop 支持哪些平台？",
];

export const title = "agent-desktop";

export const prompt =
  "使用 agent-desktop 文档回答关于 agent-desktop 的问题。";

export const ai = {} satisfies GeistdocsAIConfig;

/**
 * UI 字符串中文化（纯中文单语镜像）：中文镜像的 locale 键用 `cn`
 * （geistdocs 的 search 路由仅对 `cn` 挂载 Orama 中文分词器）。
 * display/search 之外的多余键是 fumadocs-ui 的界面文案（运行时透传）。
 */
export const translations = {
  cn: {
    displayName: "简体中文",
    search: "搜索文档",
    searchNoResult: "未找到结果",
    toc: "本页目录",
    tocNoHeadings: "本页没有目录",
    lastUpdate: "最后更新于",
    chooseLanguage: "选择语言",
    nextPage: "下一篇",
    previousPage: "上一篇",
    chooseTheme: "主题",
    editOnGithub: "在 GitHub 上编辑",
  },
};

export const basePath: string | undefined = "/docs-cn/agent-desktop";

/**
 * Unique identifier for this site, used in markdown request tracking analytics.
 */
export const siteId: string | undefined = undefined;
