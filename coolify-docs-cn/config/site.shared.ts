export const siteDefinition = {
  name: 'Coolify',
  title: 'Coolify 文档',
  description: '强大好用的自托管方案：开源的 Heroku、Netlify 与 Vercel 替代品。',
  docsBasePath: '/docs-cn/coolify',
  locale: 'zh-CN',
  themeColor: '#000000',
  keywords: ['Coolify', '自托管', '文档', '部署', 'Docker', 'PaaS'],
  og: {
    width: 1200,
    height: 630,
    background: '#000000',
    card: '#101418',
    accent: '#9333ea',
    accentSoft: '#c084fc',
    text: '#f8fafc',
    muted: '#d8def0',
  },
} as const;

/** Origin that should be the only indexed copy of the docs. */
export const productionDocsOrigin = 'https://coolify.io';

export function docsHostname(siteUrl: string): string {
  try {
    return new URL(siteUrl).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/** Only the production docs host is indexable. Preview hosts stay reachable but noindex. */
export function isIndexableDocsSite(siteUrl: string): boolean {
  return docsHostname(siteUrl) === 'coolify.io';
}

/**
 * Absolute URL for a docs path. On a non-production host the hostname is rewritten
 * to coolify.io so the canonical points at the indexed copy. The page itself stays
 * reachable; only the canonical changes.
 */
export function toCanonicalDocsUrl(siteUrl: string, pathname: string): string {
  const absolute = new URL(pathname, `${siteUrl.replace(/\/+$/, '')}/`);
  if (!isIndexableDocsSite(siteUrl)) {
    absolute.protocol = 'https:';
    absolute.hostname = 'coolify.io';
    absolute.port = '';
  }
  return absolute.toString();
}
