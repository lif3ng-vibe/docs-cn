import { defineConfig } from '@vercel/geistdocs/config';
import { content, Logo, nav, siteId, title, translations } from '@/geistdocs';
import { isSiteUrlConfigured, siteUrl } from './site-url';

export const config = defineConfig({
  title,
  // 与 next.config.ts 的 basePath 保持一致：geistdocs 用它给 sitemap、
  // markdown、页面动作等生成公开 URL。
  basePath: '/docs-cn/ai-sdk',
  // geistdocs 以 'cn' 作为中文 locale 键（search 路由仅对 'cn' 挂载
  // Orama 中文分词器，其他键会拿 displayName 当 stemmer 语言而报错）。
  defaultLanguage: 'cn',
  logo: <Logo />,
  nav,
  content,
  translations,
  siteId,
  siteUrl: isSiteUrlConfigured ? siteUrl.toString() : undefined,
  github: { owner: 'vercel', repo: 'ai' },
  agent: {
    product: {
      name: 'AI SDK',
      description: '用于构建 AI 应用与智能体的 TypeScript 工具集。',
      category: 'Developer tools',
      audience: ['JavaScript and TypeScript developers'],
      useCases: [
        '生成文本与结构化数据',
        '构建智能体与聊天界面',
        '接入语言模型提供商',
      ],
    },
  },
  ai: {
    // Ask AI 依赖服务端聊天路由，静态镜像不可用，整体关闭。
    enabled: false,
  },
  feedback: {
    // 反馈挂到 Geistdocs 平台（会往 vercel/ai 提 GitHub issue），
    // 且其 Server Action 与静态导出不兼容，关闭。
    enabled: false,
  },
  // No edit-source action yet. Upstream content still uses `NN-` filename
  // prefixes, so page paths here don't match source paths. Enable once the
  // content codemod lands on `main`.
  // Package defaults for copyPage/askAI/openInChat/scrollTop apply; only
  // edit-source stays off. Upstream content still uses `NN-` filename
  // prefixes, so page paths here don't match source paths. Enable once the
  // content codemod lands on `main`.
  pageActions: {
    editSource: false,
  },
  // Feedback uses the package default (enabled): the widget posts to the
  // Geistdocs platform, which files GitHub issues labeled with `siteId`.
});
