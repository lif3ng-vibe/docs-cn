// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

require('dotenv').config();

// Same code-block palettes as docusaurus.io (github + vsDark, with their token overrides).
const lightCodeTheme = require('./src/utils/prismLight');
const darkCodeTheme = require('./src/utils/prismDark');

// 部署路径由环境变量驱动：本地/根路径部署留空即可，GitHub Pages 子路径部署时
// 设 DOCS_SITE=https://lif3ng-vibe.github.io、DOCS_BASE=/docs-cn/litellm/。
const SITE_URL = process.env.DOCS_SITE ?? 'https://docs.litellm.ai/';
const BASE = process.env.DOCS_BASE ?? '/';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'liteLLM',
  tagline: '简化 LLM API 调用',
  // SVG favicon that turns white on dark browser themes; PNG for browsers without SVG icons
  favicon: '/img/brand/litellm-favicon.svg',
  headTags: [
    {tagName: 'link', attributes: {rel: 'alternate icon', type: 'image/png', href: '/img/brand/litellm-monogram-blue-192.png'}},
  ],

  // Set the production url of your site here
  url: SITE_URL,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: BASE,
  staticDirectories: ['static'],

  // 终检门槛：任何死链/死锚点直接构建失败。
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onBrokenMarkdownLinks: 'throw',

  // 纯中文单语站点；zh-Hans 同时决定 <html lang>。
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },
  clientModules: [require.resolve('./src/clientModules/imageZoom.js'), require.resolve('./src/clientModules/gridMarks.js'), require.resolve('./src/clientModules/lensLegacyRedirect.js')],
  plugins: [
    require('./plugins/litellm-stats'),
    require('./plugins/llms'),
    // vega-canvas tries to load the optional node `canvas` package during SSR.
    // Charts render as SVG, so resolve it to an empty module.
    () => ({
      name: 'ignore-optional-canvas',
      configureWebpack: () => ({resolve: {alias: {canvas: false}}}),
    }),
    require('./plugins/optimize-images'),
    require('./plugins/webpack-cache'),
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {from: '/docs/proxy/liteadmin_slack_native', to: '/docs/proxy/liteadmin_slack'},
          {from: '/docs/proxy/lens/coding_agents', to: '/docs/proxy/lens/coding-agents'},
          {
            from: '/docs/proxy/control_plane_and_data_plane',
            to: '/docs/proxy/multi_region',
          },
          {
            from: '/docs/proxy/high_availability_control_plane',
            to: '/docs/proxy/global_control_plane',
          },
          {
            from: '/docs/tutorials/openai_codex',
            to: '/docs/proxy/client_setup/codex_cli',
          },
          {
            from: '/docs/proxy/deploy_cloud',
            to: '/docs/proxy/deploy',
          },
          {
            from: '/docs/proxy/microservices_helm',
            to: '/docs/proxy/deploy#deploy-with-helm',
          },
          {
            from: '/docs/proxy/db_deadlocks',
            to: '/docs/proxy/prod#redis-transaction-buffer',
          },
          {
            from: '/docs/proxy/ui_credentials',
            to: '/docs/proxy/model_management#reusable-provider-credentials',
          },
          {
            from: '/docs/proxy/ui_store_model_db_setting',
            to: '/docs/proxy/model_management#database-vs-configyaml-models',
          },
          {
            from: '/docs/router_architecture',
            to: '/docs/proxy/architecture#the-router-fallbacks-and-retries',
          },
          {
            from: '/docs/proxy/image_handling',
            to: '/docs/proxy/architecture#image-url-handling',
          },
          {
            from: '/docs/observability/langfuse_otel_integration',
            to: '/docs/observability/opentelemetry_v2#2-send-traces-to-a-specific-tool-presets',
          },
          {
            from: '/docs/observability/telemetry',
            to: '/docs/observability/opentelemetry_v2',
          },
        ],
      },
    ],
    require('./plugins/docs-search'),
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 75,
        max: 1280,
        min: 640,
        steps: 2,
        disableInDev: false,
      },
    ],
    // 镜像站裁剪：release-notes 与 blog 插件随收录范围移除（源目录不收录），
    // PostHog / GA / Crisp / FeedbackRocket 等上游遥测全部剥离，镜像不外发访客数据。
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          beforeDefaultRemarkPlugins: [require('./src/remark/docs-models')],
          remarkPlugins: [require('./src/remark/raw-markdown')],
        },
        blog: false, // Disable the default blog plugin from preset-classic
        pages: {},
        theme: {
          customCss: [require.resolve('./src/css/custom.css'), require.resolve('./src/css/logo-shape.css')],
        },
      }),
    ],
  ],

  future: {
    experimental_faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      mdxCrossCompilerCache: true,
    },
  },

  themes: ['@docusaurus/theme-mermaid'],
  markdown: {
    mermaid: true,
  },

  // 上游的 FeedbackRocket 反馈脚本随遥测一并移除。
  scripts: [],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.png',
      // The whole bar links to the page; the close button still works.
      announcementBar: {
        id: 'decisions_api_2026_10',
        content:
          `<a class="announcement-link" href="${BASE}docs/decisions"><strong>Decisions API 已发布。</strong>通过统一的 /v1/decisions 端点调用 Jev、Clef 或任意决策模型。&rarr;</a>`,
        isCloseable: true,
      },
      docs: {
        sidebar: {
          // No collapse-sidebar toggle at the bottom of the sidebar
          hideable: false,
        },
      },
      navbar: {
        // Primary logo (monogram + wordmark): blue on light, white on dark,
        // per the logo guidelines. The wordmark-only secondary logo ships in
        // white only, so it cannot sit on the light header.
        // Shown beside the logo as a "DOCS" label (styled in logo-shape.css)
        title: '文档',
        logo: {
          alt: 'LiteLLM',
          src: '/img/brand/litellm-logo-blue.png',
          srcDark: '/img/brand/litellm-logo-white.png',
          width: 132,
          height: 25,
        },
        items: [
          {
            type: 'custom-productsMenu',
            label: '产品',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '文档',
          },
          {
            type: 'docSidebar',
            sidebarId: 'integrationsSidebar',
            position: 'left',
            label: '集成',
          },
          {
            type: 'docSidebar',
            sidebarId: 'enterpriseSidebar',
            position: 'left',
            label: '企业版',
          },
          {
            type: 'docSidebar',
            sidebarId: 'learnSidebar',
            position: 'left',
            label: '学习',
          },
          {
            href: 'https://trust.litellm.ai/',
            label: '信任中心',
            position: 'right',
          },
          {
            href: 'https://github.com/BerriAI/litellm',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub 仓库',
          },
          {
            href: 'https://www.litellm.ai/support',
            position: 'right',
            className: 'header-discord-link',
            'aria-label': 'Discord / Slack 社区',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '产品',
            items: [
              {label: '网关快速上手', to: '/docs/proxy/docker_quick_start'},
              {label: 'Python SDK', to: '/docs/python_sdk'},
              {label: '生产环境部署', to: '/docs/proxy/deploy'},
              {label: 'MCP 网关', to: '/docs/mcp'},
              {label: 'Agent 网关', to: '/docs/a2a'},
              {label: 'Rust AI 网关（beta）', to: '/docs/proxy/rust_gateway'},
              {label: '企业版', to: '/docs/enterprise'},
            ],
          },
          {
            title: '资源',
            items: [
              {label: 'Agent 资源', to: '/docs/agent_resources'},
              {label: 'llms.txt', href: `${SITE_URL.replace(/\/$/, '')}${BASE}llms.txt`},
              {label: '信任中心', href: 'https://trust.litellm.ai/'},
            ],
          },
          {
            title: '社区',
            items: [
              {label: 'GitHub', href: 'https://github.com/BerriAI/litellm/'},
              {label: 'Discord', href: 'https://discord.com/invite/wuPM9dRgDw'},
              {label: 'Slack', href: 'https://litellmossslack.slack.com/'},
              {label: 'YouTube', href: 'https://www.youtube.com/@LiteLLMAIGateway'},
              {label: 'X', href: 'https://twitter.com/LiteLLM'},
              {label: 'LinkedIn', href: 'https://www.linkedin.com/company/berri-ai/'},
            ],
          },
          {
            title: '公司',
            items: [
              {label: 'litellm.ai', href: 'https://www.litellm.ai/'},
              {label: '联系销售', href: 'https://www.litellm.ai/enterprise#talk-to-sales'},
              {label: '招贤纳士', href: 'https://jobs.ashbyhq.com/litellm'},
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} LiteLLM · 非官方中文镜像，仅供学习参考，版权归原作者所有`,
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
