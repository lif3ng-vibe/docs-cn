// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useClipboard',
  displayName: 'useClipboard',
  keywords: [
    'clipboard', 'copy', 'copied', 'paste', 'writeText', 'copy-to-clipboard',
    'copy button', 'announce', 'a11y', '剪贴板', '复制',
  ],
  params: [
    {
      name: 'options',
      type: 'UseClipboardOptions',
      description: '配置对象。',
      required: false,
    },
    {
      name: 'options.announce',
      type: 'string',
      description:
        '复制成功时向 polite 实时区域播报的消息。仅切换 aria-label 不可靠播报，请传入本地化的确认文案 (如 "已复制") 以便播报。省略则不播报。',
      required: false,
    },
    {
      name: 'options.resetAfterMs',
      type: 'number',
      description:
        '复制成功后 isCopied 保持 true 的毫秒数，之后回退。',
      default: '2000',
      required: false,
    },
  ],
  returns: [
    {
      name: 'copy',
      type: '(text: string) => Promise<boolean>',
      description:
        '把文本写入剪贴板。成功时翻转 isCopied 为 true、播报配置的消息、重启重置计时器并 resolve true。剪贴板被拒绝时静默无操作，复制状态不变并 resolve false。',
    },
    {
      name: 'isCopied',
      type: 'boolean',
      description:
        '最近一次复制成功后的 resetAfterMs 内为 true，然后回退。用它驱动已复制确认 (如复制 → 对勾图标切换)。',
    },
  ],
  usage: {
    description:
      '复制到剪贴板行为：剪贴板写入、带独立重置计时器的瞬时 isCopied 标志，以及可选的 polite 屏幕阅读器播报。抽取出来是为了让每个复制入口都是对一个实现的薄控制，而不是各自重造计时器与播报。快速连续复制会重启重置计时器，确认状态始终满时长；卸载时清理计时器。CodeBlock 与 Timestamp 的内置复制按钮基于它构建；构建非纯图标按钮的复制入口 (菜单项、带文字的按钮、点击即复制的值片) 时可直接使用。',
    bestPractices: [
      { guidance: true, description: '用返回的 isCopied 驱动已复制确认 (复制 → 对勾图标、文案切换)，不要自己维护状态。' },
      { guidance: true, description: '传入本地化的 announce 消息让屏幕阅读器播报复制成功；仅切换按钮 aria-label 不可靠播报。' },
      { guidance: true, description: '常见的紧凑图标复制按钮：渲染一个带 “复制” tooltip 的 ghost IconButton，onClick 接 copy()；tooltip 保持 “复制”，图标切换即确认。' },
      { guidance: false, description: '不要在 hook 之外再维护一个 copied useState；isCopied 已反映复制窗口并自动重置。' },
    ],
  },
  relatedComponents: ['CodeBlock', 'Timestamp', 'IconButton'],
  relatedHooks: ['useAnnounce'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '复制到剪贴板行为：剪贴板写入 + 带重置计时器的瞬时 isCopied + 可选 polite 屏幕阅读器播报。复制入口共享一个实现，不重造计时器/播报。快速连续复制重启计时器；卸载时清理。CodeBlock/Timestamp 的复制按钮基于它。',
  paramDescriptions: {
    options: '配置对象。',
    'options.announce': '复制成功时的 polite 实时区域消息 (如 "已复制")；仅切 aria-label 不可靠播报。省略则跳过。',
    'options.resetAfterMs': '复制后 isCopied 保持 true 的毫秒数。',
  },
  returnDescriptions: {
    copy: '(text) => Promise<boolean>：写文本、翻转 isCopied、播报、重启计时器、resolve true；被拒绝时静默无操作并 resolve false。',
    isCopied: '最近一次复制成功后 resetAfterMs 内为 true；用它驱动复制 → 对勾确认。',
  },
  usage: {
    description:
      '复制到剪贴板行为 (写入 + isCopied 标志 + 重置计时器 + 可选 polite 播报)。一个实现上的薄控制。快速连续复制重启计时器；卸载清理。非纯图标按钮的复制入口直接用它 (菜单项、文字按钮、值片)。',
    bestPractices: [
      { guidance: true, description: '用返回的 isCopied 驱动复制 → 对勾确认，别自己存状态。' },
      { guidance: true, description: '传本地化 announce 让复制被播报 (仅切 aria-label 不可靠)。' },
      { guidance: true, description: '紧凑图标复制按钮：ghost IconButton + "复制" tooltip，onClick 接 copy()；tooltip 不变，图标切换即确认。' },
      { guidance: false, description: '别在 hook 之外再维护 copied useState。' },
    ],
  },
};
