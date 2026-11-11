// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/build-the-template/template-assets/template-fonts`:
 * use the app typeface by default, and ship every font file a template needs
 * when it must bring its own.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'template-fonts',
  placement: {
    parent: 'namespace:template-assets',
    slot: 'guides',
    order: 30,
  },
  title: '字体',
  category: 'guide',
  description:
    '除非模板确实需要自带字体，否则文本应沿用应用的字型；确需自带时，随模板交付它用到的每个字体文件。',
  sections: [
    {
      id: 'prefer-host-typography',
      title: '优先使用宿主排版',
      content: [
        {
          type: 'prose',
          text: '使用 Astryx 排版组件与主题值，除非模板必须展示某个特定的授权字型。被复制的模板通常应继承应用的排版，而不是安装新的全局字体。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '不要只是为了示例内容看起来更精致而添加字体。',
            '不要在模板里覆盖应用的正文（body）字体。',
            '只为集成包所承载的真实产品或内容需求使用自定义字体。',
          ],
        },
      ],
    },
    {
      id: 'package-a-required-font',
      title: '打包必需的字体',
      content: [
        {
          type: 'prose',
          text: '把字体文件放在包自有的样式表旁边。样式表可以使用相对 `url()` 路径，因为它留在包内；模板通过其公开路径导入该样式表（{@link generic:template-styles}）。',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'styles/acme-dashboard.css',
          code: `@font-face {
  font-family: 'Acme Sans';
  src: url('../assets/fonts/acme-sans-regular.woff2') format('woff2');
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}

.acme-dashboard-title {
  font-family: 'Acme Sans', sans-serif;
}`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'WOFF2 能覆盖受支持的浏览器时只交付 WOFF2。仅当这些浏览器另有要求时才增加其他格式。',
            '声明模板用到的每个字重与样式。不要因缺少文件而让浏览器合成粗体或斜体。',
            '使用 `font-display: swap`，除非产品需求与性能测试证明应取其他值。',
            '确认字体许可允许在集成包中再分发。',
          ],
        },
        {
          type: 'prose',
          text: '导出样式表并不会发布它所指向的字体文件。还要把字体目录一并纳入包中（{@link generic:export-template-assets}）。',
        },
      ],
    },
    {
      id: 'check-fonts-in-the-app',
      title: '在应用中检查字体',
      content: [
        {
          type: 'prose',
          text: '在应用中测试模板时（{@link generic:test-template-in-app}），还需确认以下几点。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '每个字体请求都能从构建产物路径成功加载。',
            '计算样式（computed styles）显示的是请求的字族、字重与样式。',
            '字体加载缓慢或失败时，回退字体栈仍保证文本可读。',
          ],
        },
      ],
    },
  ],
};
