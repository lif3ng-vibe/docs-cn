// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/build-the-template/package-and-test/test-template-in-app`:
 * copy the packed template into a clean app, build it, and render it the way
 * apps will.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'test-template-in-app',
  placement: {
    parent: 'namespace:package-and-test',
    slot: 'guides',
    order: 30,
  },
  title: '在应用中测试',
  category: 'guide',
  description:
    '验证模板在应用的实际使用方式下能正常工作：从打包好的包安装、复制、构建并渲染。',
  sections: [
    {
      id: 'install-the-packed-package',
      title: '安装打包好的包',
      content: [
        {
          type: 'prose',
          text: '按 {@link generic:test-in-an-app} 所述，将打包好的包安装进一个干净的应用。同时安装复制来的源码所导入的每一个库，例如其图标库。每次改动后都重新打包并重装。',
        },
      ],
    },
    {
      id: 'copy-the-template',
      title: '复制模板',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: `# Confirm discovery and metadata
astryx --json template --list --package @acme/astryx-widgets

# Inspect source without writing
{@command template acme-dashboard --package @acme/astryx-widgets}

# Copy a page and a block to their real app locations
{@command template acme-dashboard --package @acme/astryx-widgets src/app/acme-dashboard}
{@command template acme-stat-card --package @acme/astryx-widgets src/components}`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '确认复制得到的文件：`src/app/acme-dashboard/page.tsx` 与 `src/components/acme-stat-card.tsx`。',
            '检查复制来的源码，确认占位符已替换、相对引用有效。',
            '将复制的区块导入到真实页面中。从未被导入的文件等于没有测试过。',
          ],
        },
      ],
    },
    {
      id: 'build-every-supported-app',
      title: '在每个受支持的应用中构建',
      content: [
        {
          type: 'prose',
          text: '在该集成支持的每一种框架或打包器中，都运行类型检查（`{@pm exec tsc --noEmit}`，或应用自带的脚本）与生产构建。一条工具链通过并不能证明另一条也通过。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `{@pm exec tsc --noEmit}
{@pm run build}`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '每一个导入都能从复制后的位置解析成功。',
            '生产构建保留了必需的副作用 CSS。',
            '没有任何导入绕过 `exports`，也没有依赖只能靠 workspace 提升才能解析。',
          ],
        },
      ],
    },
    {
      id: 'render-the-behavior-matrix',
      title: '渲染行为矩阵',
      content: [
        {
          type: 'table',
          headers: ['维度', '必查项'],
          rows: [
            ['宽度', '宽与窄两种；包含受支持的最小视口'],
            ['配色', '每一种受支持的配色模式与主题'],
            ['输入', '主要任务的键盘与指针操作'],
            [
              '内容',
              '该模式支持的逼真、空、超长、加载与错误状态',
            ],
            [
              '资源',
              'CSS、字体、图标、图片、封面图与视频请求全部成功',
            ],
            [
              '运行时',
              '无控制台错误、无 hydration 不匹配、无缺少 Provider 导致的失败',
            ],
          ],
        },
        {
          type: 'prose',
          text: '检查渲染出的层级、阅读顺序、焦点顺序、裁剪、溢出与回退状态。单个默认状态的截图不构成完整测试。',
        },
      ],
    },
    {
      id: 'grade-the-result',
      title: '为结果评级',
      content: [
        {
          type: 'prose',
          text: '使用本次测试得到的证据，为打包出的那个修订版本评级（{@link namespace:write-good-templates}）。',
        },
      ],
    },
  ],
};
