// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/build-the-template/template-assets/template-images-media`:
 * keep template images and video working after the copy, or make them clear
 * placeholders.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'template-images-media',
  placement: {
    parent: 'namespace:template-assets',
    slot: 'guides',
    order: 50,
  },
  title: '图片与媒体',
  category: 'guide',
  description:
    '确保每张图片与每段视频在复制后仍然可用，或成为应用会替换的清晰占位符。',
  sections: [
    {
      id: 'do-not-copy-relative-media',
      title: '不要依赖同级媒体文件',
      content: [
        {
          type: 'prose',
          text: '`./hero.png`、`../assets/demo.mp4` 这类引用在复制出的文件中保持原样，通常因此失效。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '集成方会继续托管该媒体时，使用稳定的公开 URL。',
            '每个应用都必须提供自家产品媒体时，使用显式的应用侧占位符。',
            '仅当所有受支持的应用工具链都能解析并产出底层资源时，才使用包自有的 JS 或 CSS 入口。',
            '不要以为 `node_modules` 里的文件会自动以浏览器 URL 的形式被服务。',
          ],
        },
      ],
    },
    {
      id: 'understand-template-assets',
      title: '理解 `/template-assets`',
      content: [
        {
          type: 'prose',
          text: '`/template-assets/<path>` 是仅用于预览的固定资源路径。复制时，Astryx 会把完整的静态图片引用替换为内联的中性 SVG 占位图；会把完整的静态视频引用替换为空字符串，因为它无法生成有效的内联视频。',
        },
        {
          type: 'table',
          headers: ['源引用', '复制结果'],
          rows: [
            ['`/template-assets/hero.png`', '内联 SVG data URL 占位图'],
            ['`/template-assets/demo.mp4`', '空字符串'],
            ['`./hero.png` 或 `/product/hero.png`', '保持不变'],
            ['`https://example.com/template-assets/hero.png`', '保持不变'],
          ],
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '预览支持的图片后缀为 SVG、PNG、JPG、JPEG、GIF、WebP、AVIF 与 ICO。',
            '预览支持的视频后缀为 MP4、WebM、MOV、OGV 与 M4V。',
            '预览路径要保持为单个完整静态字符串。当 Astryx 无法安全替换时，拼接、插值、方法调用、模块导入与未知文件格式都会被拒绝。',
            '只有当占位符就是你想要的复制结果时才使用该路径。它不是交付必需产品媒体的手段。',
            'Astryx 只在自己的文档中服务 `/template-assets`。你自建的预览必须自己服务该路径。',
          ],
        },
      ],
    },
    {
      id: 'design-a-useful-placeholder',
      title: '设计有用的占位符',
      content: [
        {
          type: 'prose',
          text: '当最终资源必须由应用提供时，让复制出的源码中的替换点一目了然。保留足够的周边布局与示例数据，使模板仍能讲清该模式，而不是假装最终内容已经包含在内。',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `const HERO_IMAGE = '/acme-dashboard-hero.jpg';
// Replace HERO_IMAGE with an app-owned public URL before shipping the page.

<img
  src={HERO_IMAGE}
  alt="Account health trends for the current quarter"
  width={1200}
  height={675}
/>`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '信息性图片使用准确的替代文本；装饰性图片用 `alt=""`。',
            '提供尺寸或宽高比容器，避免加载时页面抖动。',
            '视频要提供控件与有用的封面图；内容需要时提供字幕。',
            '复制出的源码中不要留下无法访问、会过期、需鉴权或依赖特定环境的 URL。',
          ],
        },
      ],
    },
    {
      id: 'check-media-in-the-app',
      title: '在应用中检查媒体',
      content: [
        {
          type: 'prose',
          text: '在应用中测试模板时（{@link generic:test-template-in-app}），还需确认以下几点。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '复制出的源码呈现你所预期的占位符替换。',
            '网络日志中没有缺失、重定向、被拦截或未授权的媒体请求。',
            '每个占位符都保持布局，并说明应用需要替换什么。',
          ],
        },
      ],
    },
  ],
};
