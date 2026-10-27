import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import * as React from 'react';
import { DocsLink } from '@/components/docs-link';
import SearchDialog from '@/components/layout/search';
import { absoluteUrl, publicAssetFallbackPath, site } from '@/lib/config/site';
import '@/styles/app.css';

export const Route = createRootRoute({
  head: () => {
    const rootOgImage = `${site.docsBasePath}/og/index.png`;

    return {
      meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: site.title,
      },
      {
        name: 'description',
        content: site.description,
      },
      {
        name: 'theme-color',
        content: site.themeColor,
      },
      {
        name: 'robots',
        content: site.indexable ? 'index,follow' : 'noindex, nofollow',
      },
      {
        property: 'og:site_name',
        content: site.title,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: site.title,
      },
      {
        property: 'og:description',
        content: site.description,
      },
      {
        property: 'og:image',
        content: rootOgImage,
      },
      {
        property: 'og:image:type',
        content: 'image/png',
      },
      {
        property: 'og:image:width',
        content: String(site.og.width),
      },
      {
        property: 'og:image:height',
        content: String(site.og.height),
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: site.title,
      },
      {
        name: 'twitter:description',
        content: site.description,
      },
      {
        name: 'twitter:image',
        content: rootOgImage,
      },
      {
        name: 'keywords',
        content: site.keywords.join(', '),
      },
      ],
      links: [
        { rel: 'icon', href: publicAssetFallbackPath('/brand/favicon.ico'), type: 'image/x-icon', sizes: 'any' },
        { rel: 'shortcut icon', href: publicAssetFallbackPath('/brand/favicon.ico') },
        { rel: 'manifest', href: publicAssetFallbackPath('/site.webmanifest') },
        { rel: 'alternate', href: absoluteUrl(site.llmsUrl), title: 'Coolify LLM Index', type: 'text/plain' },
      ],
    };
  },
  notFoundComponent: function RootNotFound() {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-4xl font-semibold">404</p>
        <p className="text-lg text-fd-muted-foreground">页面不存在或已被移动。</p>
        <a
          href={publicAssetFallbackPath('/')}
          className="rounded-lg border bg-fd-secondary/50 px-4 py-2 text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
        >
          返回文档首页
        </a>
      </div>
    );
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang={site.locale} suppressHydrationWarning>
      <head>
        <HeadContent />
        {site.plausible.enabled ? (
          <script
            defer
            data-domain={site.plausible.domain}
            src={site.plausible.scriptUrl}
            {...(site.plausible.apiHost
              ? {
                  'data-api': `${site.plausible.apiHost}/api/event`,
                }
              : {})}
          />
        ) : null}
      </head>
      <body className="flex min-h-screen flex-col">
        <RootProvider
          components={{ Link: DocsLink }}
          search={{ SearchDialog }}
          i18n={{
            locale: 'zh-CN',
            translations: {
              search: '搜索文档…',
              searchNoResult: '未找到相关结果',
              toc: '本页内容',
              tocNoHeadings: '本页没有小标题',
              lastUpdate: '最后更新于',
              chooseLanguage: '选择语言',
              nextPage: '下一篇',
              previousPage: '上一篇',
              chooseTheme: '切换主题',
              editOnGithub: '在 GitHub 上编辑',
            },
          }}
        >
          <Outlet />
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
