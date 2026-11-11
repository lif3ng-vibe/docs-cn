// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs migration/migration-verification`: post-migration
 * verification checklist and AI migration prompt.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'migration-verification',
  title: '验证',
  placement: {parent: 'namespace:migration', slot: 'guides', order: 30},
  category: 'guide',
  description:
    '迁移完成后的验证清单，以及可粘贴进编码工具的 AI 迁移提示词。',
  keywords: [
    '验证',
    '清单',
    'AI 提示词',
  ],

  sections: [
    {
      title: '验证清单',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '在浅色与深色模式下运行应用，检查表面、边框、文字、图标、悬停状态、焦点环与状态色是否浑然一体。',
            '从外壳打开命令面板，向其中输入文字、用键盘选中条目，并确认焦点回到触发器。',
            '检查 SideNav 的收起、展开、激活、悬停、嵌套与移动端各状态。',
            '在 jsdom 和真实浏览器中验证设置弹层与对话框，因为原生 dialog 与 [`Popover`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) API 可能需要测试桩。',
            '每迁移完一个路由，就搜索一遍残留的硬编码 Tailwind 颜色、任意 hex 值与一次性的悬停色。',
            '每个迁移完的路由都运行组件测试、构建，并至少做一轮浏览器截图。',
          ],
        },
      ],
    },
    {
      title: 'AI 迁移提示词',
      content: [
        {
          type: 'prose',
          text: '使用 AI 编码智能体（agent）时，给它一个明确的迁移循环，而不是要求一次性重写整个应用。',
        },
        {
          type: 'code',
          lang: 'text',
          label: '把这段粘贴给你的 AI',
          code: `We are migrating this existing Tailwind/shadcn app to Astryx incrementally.

First run:
- astryx docs migration --dense
- astryx docs theme --dense
- astryx docs styling --dense
- astryx template AppShellTopNavWithSideNav --skeleton

Then migrate one route or shell surface at a time. Keep business logic and routing intact. Replace shadcn/Radix/Tailwind primitives with Astryx components, remove hardcoded colors, verify light and dark mode, and take screenshots before moving to the next surface.`,
        },
      ],
    },
  ],
};
