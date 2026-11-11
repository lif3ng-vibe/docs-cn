// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableRowStatus',
  subComponentOf: 'Table',
  displayName: 'useTableRowStatus',
  description:
    '返回 TablePlugin 的 Hook，前置一个窄列来标示每行的状态。返回 {status, label} 表示语义化的成功、警告或错误：Table 通过当前主题解析对应的图形符号和色调。返回 {color, icon?, label} 表示自定义标记：颜色只决定着色，省略 icon 渲染稳定的 8px 圆点，显式 icon 渲染调用方选择的图形符号。具名自定义图标保留其已发布的 Icon 颜色映射；原生 CSS 自定义图标继承调用方的精确着色，而不是以前的主色回退。现有调用方无需迁移源码。label 必填，会成为无障碍图像名称并附带补充性的悬停工具提示；返回 null 则不显示指示器。列头视觉上为空白，但携带仅供屏幕阅读器读取的本地化名称（"Row status"，i18n key 为 @astryx.table.rowStatus.columnHeader）。请用 useCallback 记忆化 getStatus，以保持插件标识稳定。',
  props: [
    {
      name: 'getStatus',
      type: "(item: T) => ({ status: 'success' | 'warning' | 'error'; color?: never; icon?: never; label: string } | { status?: never; color: 'accent' | 'success' | 'error' | 'warning' | 'red' | 'orange' | 'green' | 'yellow' | 'blue' | 'gray' | string; icon?: IconName; label: string }) | null",
      description:
        '推导语义化结果或自定义标记。{status, label} 接受封闭的 success/error/warning 词表，并通过当前主题解析其图形符号和色调。{color, icon?, label} 保持稳定的自定义标记路径：颜色始终决定着色，无 icon 渲染 8px 圆点，icon 渲染调用方显式选择的图形符号。即使颜色值名为 success/error/warning，无 icon 时仍是圆点。有效 icon 名称：close, chevronDown, chevronLeft, chevronRight, chevronsLeft, chevronsRight, check, success, error, warning, info, calendar, clock, externalLink, menu, moreHorizontal, search, upload, arrowUp, arrowDown, arrowsUpDown, funnel, eyeSlash, viewColumns, copy, checkDouble, wrench, stop, microphone。两个分支互斥，label 必填并通过 role="img" 播报，返回 null 则行状态单元格留空。请用 useCallback 记忆化，以保持插件标识稳定。',
      required: true,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '返回带窄的每行状态列的 TablePlugin。{status,label} 解析主题化的 success/error/warning 图形符号 + 色调。稳定的 {color,icon?,label} 保持自定义：颜色只决定着色，无 icon = 8px 圆点，icon = 调用方图形符号。label 必填；null 留空单元格。请记忆化 getStatus。',
  propDescriptions: {
    getStatus:
      '将行映射为语义化 {status,label}、自定义 {color,icon?,label} 或 null。语义化 status 由主题决定图形符号 + 色调。自定义 color 始终决定着色；省略 icon = 圆点，显式 icon = 调用方图形符号。分支互斥，label 必填。',
  },
};
