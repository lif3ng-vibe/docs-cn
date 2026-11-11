// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useResizable',
  displayName: 'useResizable',
  group: 'Resizable',
  keywords: [
    'resize',
    'resizable',
    'drag',
    'split',
    'panel',
    'sidebar',
    '调整大小',
    '可调整大小',
    '拖拽',
    '分割',
    '面板',
    '侧边栏',
    '分隔条',
  ],
  params: [
    {
      name: 'defaultSize',
      type: 'SizeValue | ResizableSize',
      description:
        '初始尺寸。数字、精确 "Npx" 与 pixel(value) 按像素处理。精确 "N%" 无附加像素边界。percent(value, {min: pixel(value)}) 或 percent(value, {max: pixel(value)}) 添加一个像素下限或上限。百分比只解析一次为像素——提供 containerRef 时以其为基准，否则以视口为基准——之后不再追踪其基准。已发布的宽泛 number | string 类型保持兼容；运行时校验为准。',
      default: '250',
    },
    {
      name: 'minSize',
      type: 'ResizableSize',
      description:
        '最小尺寸。数字、精确 "Npx" 与 pixel(value) 仍按像素处理；精确 "N%" 无附加像素边界；percent(value, {min: pixel(value)}) 或 percent(value, {max: pixel(value)}) 恰好添加一个边界。百分比最小值会在基准变化时重新解析，并钳制当前像素选值。',
      default: '50',
    },
    {
      name: 'maxSize',
      type: 'ResizableSize',
      description:
        '最大尺寸。数字、精确 "Npx" 与 pixel(value) 仍按像素处理；精确 "N%" 无附加像素边界；percent(value, {min: pixel(value)}) 或 percent(value, {max: pixel(value)}) 恰好添加一个边界。百分比最大值会在基准变化时重新解析，并钳制当前像素选值。',
      default: 'Infinity',
    },
    {
      name: 'containerRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        '百分比所占份额的参照元素。由调用方提供：Hook 从不自行推断。省略时百分比以视口为基准，这是已发布的行为。ref 可随时间指向不同元素——基准随之变化。在该元素真正完成布局前（未挂载、display:none、已脱离文档），百分比使用临时 1200px 基准而非其零值测量，且不会据此持久化任何内容。',
    },
    {
      name: 'direction',
      type: "'horizontal' | 'vertical'",
      description:
        '区域沿哪个轴调整大小。选择容器的 inline 或 block content-box 尺寸作为百分比基准，且必须与传给 ResizeHandle 的 direction 一致。',
      default: "'horizontal'",
    },
    {
      name: 'collapsible',
      type: 'boolean',
      description:
        '拖拽抬离或按键步进低于折叠阈值时，是否将区域折叠为零。',
      default: 'false',
    },
    {
      name: 'snaps',
      type: 'number[]',
      description: '拖拽时吸附到的像素值。',
    },
    {
      name: 'autoSaveId',
      type: 'string',
      description: '跨会话将尺寸与折叠状态持久化到 localStorage 的键。',
    },
    {
      name: 'defaultIsCollapsed',
      type: 'boolean',
      description: '初始折叠状态（非受控）。持久化的记录优先于它。',
      default: 'false',
    },
    {
      name: 'isCollapsed',
      type: 'boolean',
      description:
        '受控折叠状态。此后 collapse()、expand()、越过阈值的拖拽抬离或按键步进、以及重新展开区域的拖拽，都通过 onCollapseChange 上报，而非在内部改状态。',
    },
    {
      name: 'onCollapseChange',
      type: '(isCollapsed: boolean) => void',
      description:
        '每次折叠状态变化时调用一次：关闭区域的拖拽抬离或按键步进、重新展开它的拖拽或按键、Enter、双击，或调用 collapse()、expand()、resize()。',
    },
  ],
  returns: [
    {
      name: 'size',
      type: 'number',
      description: '当前尺寸（像素）。',
    },
    {
      name: 'isCollapsed',
      type: 'boolean',
      description: '区域当前是否折叠。',
    },
    {
      name: 'collapse',
      type: '() => void',
      description: '以编程方式折叠区域。',
    },
    {
      name: 'expand',
      type: '() => void',
      description: '从折叠状态展开。',
    },
    {
      name: 'resize',
      type: '(size: number) => void',
      description: '调整到指定像素值。',
    },
    {
      name: 'props',
      type: 'ResizableProps',
      description: '展开到可调组件上或传给 ResizeHandle 的 props。',
    },
  ],
  usage: {
    description:
      '为布局区域添加拖拽调整大小行为的 Hook。支持单区域与多区域配置，包含吸附点、可折叠面板、localStorage 持久化与级联调整顺序。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用 percent(40, {min: pixel(333)}) 表示带 333px 下限的 40% 尺寸，或 percent(10, {max: pixel(400)}) 表示带 400px 上限的 10% 尺寸。options 参数必填，且只携带下限或上限其一。',
      },
      {
        guidance: true,
        description:
          '结构化默认值只是初始选择；结构化的 minSize 或 maxSize 始终生效。状态、持久化、回调、resize()、绘制与 ARIA 全部使用解析后的像素数值。',
      },
      {
        guidance: true,
        description:
          '在 Server Component 中构造配置时，从 @astryxdesign/core/Resizable/utils 导入 percent 与 Table 同款 pixel 绑定；根包只暴露一个 pixel 符号与一个 percent 符号，不会冲突。',
      },
      {
        guidance: true,
        description:
          '与 Layout 或 AppShell 侧边栏搭配，实现可调整大小的导航面板。',
      },
      {
        guidance: true,
        description:
          '设置 autoSaveId，在页面刷新后保留用户选择的尺寸。',
      },
      {
        guidance: false,
        description:
          '不要把 minSize 设得过小；内容会变得不可读。可整体隐藏的面板请改用 collapsible。',
      },
    ],
  },
  relatedComponents: ['Resizable', 'AppShell', 'Layout', 'SideNav'],
  relatedHooks: ['useCollapsible'],
  importPath: '@astryxdesign/core/Resizable',
  category: 'layout',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '为布局区域添加拖拽调整大小行为。支持单/多区域配置，含吸附点、可折叠面板、localStorage 持久化与级联调整顺序。',
  paramDescriptions: {
    defaultSize:
      '初始像素值、精确 N% 或 percent(value, {min: pixel(value)}) / percent(value, {max: pixel(value)})；只解析一次。',
    minSize:
      '实时最小值：像素、精确 N% 或 percent(value, {min: pixel(value)}) / percent(value, {max: pixel(value)})。',
    maxSize:
      '实时最大值：像素、精确 N% 或 percent(value, {min: pixel(value)}) / percent(value, {max: pixel(value)})。',
    containerRef: '百分比所占份额的参照元素。',
    direction: '沿哪个轴调整大小。',
    collapsible: '拖拽抬离或按键步进低于折叠阈值时是否将区域折叠为零。',
    snaps: '拖拽时吸附的像素值。',
    autoSaveId: '跨会话持久化尺寸与折叠状态到 localStorage 的键。',
    defaultIsCollapsed: '初始折叠状态（非受控）；持久化记录优先。',
    isCollapsed:
      '受控折叠状态；collapse()/expand()/抬离/按键步进/重新展开的拖拽改为上报而非内部变更。',
    onCollapseChange: '每次折叠状态变化时调用一次。',
  },
  returnDescriptions: {
    size: '当前尺寸（px）。',
    isCollapsed: '区域当前是否折叠。',
    collapse: '以编程方式折叠区域。',
    expand: '从折叠状态展开。',
    resize: '调整到指定 px 值。',
    props: '展开到可调组件上 / 传给 ResizeHandle 的 props。',
  },
  usage: {
    description:
      '为布局区域添加拖拽调整大小行为。支持单/多区域配置，含吸附点、可折叠面板、localStorage 持久化与级联调整顺序。',
    bestPractices: [
      {
        guidance: true,
        description:
          '与 Layout / AppShell 侧边栏搭配，实现可调整大小的导航面板。',
      },
      {
        guidance: true,
        description:
          '设置 autoSaveId，在页面刷新后保留用户选择的尺寸。',
      },
      {
        guidance: false,
        description:
          '不要把 minSize 设得过小；内容会变得不可读。可整体隐藏的面板请改用 collapsible。',
      },
    ],
  },
};
