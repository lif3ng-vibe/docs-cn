import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

import { rehypeBaseLinks } from './src/plugins/base-links.mjs';
import { rehypePagefindCommandReferences } from './src/plugins/pagefind-command-references.mjs';
import { rehypeResponsiveTables } from './src/plugins/responsive-tables.mjs';
import { rehypeStableHeadingIds } from './src/plugins/stable-heading-ids.mjs';
import { sidebar } from './src/site-navigation.mjs';
import { sitemapCompatibility } from './src/plugins/sitemap-compatibility.mjs';
import {
  pluginWorktrunkTerminal,
  rehypeComparisonCommands,
} from './src/plugins/worktrunk-terminal.mjs';
import {
  worktrunkDarkCodeTheme,
  worktrunkLightCodeTheme,
} from './src/themes/worktrunk-code.mjs';

const repository = 'https://github.com/max-sixty/worktrunk';
const site = 'https://lif3ng-vibe.github.io';
const base = '/docs-cn/worktrunk/';

export default defineConfig({
  site,
  base,
  devToolbar: {
    enabled: false,
  },
  markdown: {
    processor: unified({
      rehypePlugins: [
        rehypeStableHeadingIds,
        [rehypeBaseLinks, base],
        rehypePagefindCommandReferences,
        rehypeComparisonCommands,
        rehypeResponsiveTables,
      ],
    }),
  },
  integrations: [
    starlight({
      title: 'Worktrunk',
      description: '面向并行 AI agent 工作流的 Git worktree 管理工具。',
      defaultLocale: 'root',
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
      disable404Route: true,
      favicon: '/favicon.png',
      logo: {
        src: './public/logo.png',
        alt: 'Worktrunk',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: repository },
      ],
      tableOfContents: {
        minHeadingLevel: 1,
        maxHeadingLevel: 2,
      },
      editLink: {
        baseUrl: `${repository}/edit/main/docs/`,
      },
      customCss: ['./src/styles/custom.css'],
      components: {
        Footer: './src/components/Footer.astro',
        Head: './src/components/Head.astro',
        PageTitle: './src/components/PageTitle.astro',
        Pagination: './src/components/Pagination.astro',
        SocialIcons: './src/components/SocialIcons.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      expressiveCode: {
        // Shell examples render as plain code, without terminal window chrome.
        defaultProps: { frame: 'code' },
        plugins: [pluginWorktrunkTerminal()],
        themes: [worktrunkDarkCodeTheme, worktrunkLightCodeTheme],
        useStarlightUiThemeColors: true,
        styleOverrides: {
          borderRadius: '0',
          codeFontFamily: 'var(--sl-font-mono)',
          frames: {
            frameBoxShadowCssValue: 'none',
          },
        },
      },
      sidebar,
    }),
    sitemap({
      filter: (page) => ![
        `${site}${base}404/`,
        `${site}${base}worktrunk/`,
        `${site}${base}try-it/`,
      ].includes(page),
    }),
    sitemapCompatibility(),
  ],
});
