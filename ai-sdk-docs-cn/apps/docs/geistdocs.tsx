import { LogoAiSdk } from '@vercel/geistdocs/assets/logos/logo-ai-sdk';
import type { GeistdocsConfig } from '@vercel/geistdocs/config';

export const title = 'AI SDK';

/**
 * Label for events sent to the Geistdocs platform (feedback issues and
 * markdown-request tracking).
 */
export const siteId = 'ai-sdk';

// The logo SVG is aria-hidden; the visually hidden text keeps an
// accessible name on the wordmark link.
export const Logo = () => (
  <>
    <LogoAiSdk />
    <span className="sr-only">AI SDK</span>
  </>
);

export const nav: NonNullable<GeistdocsConfig['nav']> = [
  { label: '文档', href: '/docs' },
  {
    label: '资源',
    items: [
      { label: '菜谱', href: '/resources/recipes' },
      { label: '工具注册表', href: '/resources/tools' },
      { label: '模板', href: '/resources/templates' },
      { label: '案例', href: '/resources/showcase' },
    ],
  },
  { label: '提供商', href: '/providers' },
  { label: 'Playground', href: 'https://playground.ai-sdk.dev' },
];

export const content: NonNullable<GeistdocsConfig['content']> = [
  { id: 'v7', label: 'v7', dir: 'content/v7/docs', route: '/docs' },
  {
    id: 'providers-v7',
    label: 'Providers (v7)',
    dir: 'content/v7/providers',
    route: '/providers',
  },
  {
    id: 'cookbook-v7',
    label: 'Cookbook (v7)',
    dir: 'content/v7/cookbook',
    route: '/cookbook',
  },
];

/**
 * UI 字符串中文化（纯中文单语镜像）：键位是站点的默认语言。
 * display/search 之外的多余键是 fumadocs-ui 的界面文案（运行时透传），
 * 类型层面 GeistdocsTranslation 未声明，故不加类型注解。
 */
export const translations = {
  cn: {
    displayName: '简体中文',
    search: '搜索文档',
    searchNoResult: '未找到结果',
    toc: '本页目录',
    tocNoHeadings: '本页没有目录',
    lastUpdate: '最后更新于',
    chooseLanguage: '选择语言',
    nextPage: '下一篇',
    previousPage: '上一篇',
    chooseTheme: '主题',
    editOnGithub: '在 GitHub 上编辑',
  },
};
