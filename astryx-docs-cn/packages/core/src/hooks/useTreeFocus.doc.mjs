// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useTreeFocus',
  displayName: 'useTreeFocus',
  keywords: ['tree', '树形', 'treeview', 'focus', 'keyboard', '键盘', 'navigation', 'arrow', 'expand', '展开', 'collapse', '折叠', 'roving', 'tabindex', 'a11y', 'wai-aria', 'apg'],
  params: [
    {
      name: 'options',
      type: 'UseTreeFocusOptions',
      description: '树形焦点行为的配置对象。',
      required: false,
    },
    {
      name: 'options.itemSelector',
      type: 'string',
      description: '树内可见 treeitem 的选择器，按 DOM 顺序。',
      default: "'[role=\"treeitem\"]'",
      required: false,
    },
    {
      name: 'options.isItemDisabled',
      type: '(item: HTMLElement) => boolean',
      description: '判断 treeitem 是否禁用、导航时须跳过的谓词。默认读取 `data-tree-disabled` / `aria-disabled`。',
      required: false,
    },
    {
      name: 'options.getLevel',
      type: '(item: HTMLElement) => number',
      description: '读取 treeitem 从 1 开始的嵌套层级。默认读取 `aria-level` 属性。',
      required: false,
    },
    {
      name: 'options.onToggleExpand',
      type: '(id: string) => void',
      description: '用于展开/折叠给定 id 的 treeitem（折叠的父项按 ArrowRight、展开的父项按 ArrowLeft、无自身操作的父项按 Enter/Space 时调用）。',
      required: false,
    },
    {
      name: 'options.onActivate',
      type: '(item: HTMLElement, id: string | undefined) => boolean | void',
      description: 'Enter/Space 激活 treeitem 时调用。已处理时返回 true；返回 false/undefined 让 hook 回退为切换展开状态。',
      required: false,
    },
    {
      name: 'options.onActiveChange',
      type: '(id: string | undefined) => void',
      description: 'hook 把焦点移到某个 treeitem 时收到通知。使用方借此移动唯一的 roving tab 停留点。',
      required: false,
    },
    {
      name: 'options.hasRovingTabIndex',
      type: 'boolean',
      description: '为 true 时，hook 在可见 treeitem 间持有唯一的 roving tab 停留点（写 tabindex 0/-1、挂载时修复、随导航移动）。挂载时保留已有的 tabindex="0" 种子。挂上返回的 `handleFocus` 以在点击后保持停留点同步。',
      default: 'false',
      required: false,
    },
    {
      name: 'options.typeahead',
      type: 'boolean',
      description: '是否启用 typeahead（跳到文本以所键字符开头的下一项，忽略大小写与变音符，各 locale 下均忽略带划线字母 đ ł ø ħ ŧ ƀ 及土耳其语 ı/İ）。',
      default: 'true',
      required: false,
    },
  ],
  returns: [
    {
      name: 'treeRef',
      type: 'React.RefObject<HTMLElement | null>',
      description: '挂到树容器元素（role="tree"）上的 ref。',
    },
    {
      name: 'handleKeyDown',
      type: '(e: React.KeyboardEvent) => void',
      description: '挂到树容器上的按键按下处理器。',
    },
    {
      name: 'handleFocus',
      type: '(e: React.FocusEvent) => void',
      description: '挂到容器 onFocus 的焦点处理器。启用 hasRovingTabIndex 时保持 roving tab 停留点同步；否则为空操作，始终可以安全挂载。',
    },
    {
      name: 'focusFirst',
      type: '() => void',
      description: '聚焦第一个可用的可见 treeitem。',
    },
    {
      name: 'focusLast',
      type: '() => void',
      description: '聚焦最后一个可用的可见 treeitem。',
    },
  ],
  usage: {
    description:
      '管理 roving-tabindex 焦点与 WAI-ARIA 树形键盘模型。ArrowUp/ArrowDown/Home/End 在可见 treeitem 间线性移动（跳过禁用项），ArrowRight/ArrowLeft 承载树语义（展开/折叠，移到第一个子项/父项）。Enter/Space 激活，可打印字符触发 typeahead。',
    bestPractices: [
      { guidance: true, description: '用于层级树组件：把 onToggleExpand 接到展开状态，把 onActiveChange 接到唯一的 roving tab 停留点。' },
      { guidance: true, description: '把 treeRef 与 handleKeyDown 都挂到 role="tree" 容器元素上。' },
      { guidance: false, description: '不要用于线性列表（请改用 useListFocus）或二维网格（请改用 useGridFocus）；那些遍历方式与树不同。' },
    ],
  },
  relatedComponents: ['TreeList'],
  relatedHooks: ['useListFocus', 'useGridFocus', 'useFocusTrap'],
  importPath: '@astryxdesign/core/hooks',
  category: 'focus',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '管理 roving-tabindex 焦点 + WAI-ARIA 树形键盘模型。ArrowUp/Down/Home/End 在可见 treeitem 间线性移动（跳过禁用项）；ArrowRight/Left 承载树语义（展开/折叠，移到第一个子项/父项）。Enter/Space 激活；可打印字符触发 typeahead。',
  paramDescriptions: {
    options: '树形焦点行为的配置。',
    'options.itemSelector': '可见 treeitem 的选择器，按 DOM 顺序。',
    'options.isItemDisabled': '谓词：treeitem 是否禁用（导航中跳过）。默认读 data-tree-disabled / aria-disabled。',
    'options.getLevel': '读取从 1 开始的嵌套层级。默认读 aria-level 属性。',
    'options.onToggleExpand': '按 id 展开/折叠 treeitem（折叠父项按 ArrowRight、展开父项按 ArrowLeft、无自身操作的父项按 Enter/Space）。',
    'options.onActivate': 'Enter/Space 激活时调用。已处理返回 true；否则 hook 回退为切换展开。',
    'options.onActiveChange': '焦点移到 treeitem 时收到通知。用于移动唯一的 roving tab 停留点。',
    'options.hasRovingTabIndex': 'hook 持有唯一 roving tab 停留点（写 tabindex 0/-1、挂载时修复、随导航移动）。保留已有 tabindex="0" 种子。挂上 handleFocus 以在点击后同步。',
    'options.typeahead': '启用 typeahead（跳到文本以所键字符开头的下一项，忽略大小写、变音符、带划线字母 + 土耳其语 ı/İ）。',
  },
  returnDescriptions: {
    treeRef: '挂到树容器（role="tree"）的 ref。',
    handleKeyDown: '树容器的按键按下处理器。',
    handleFocus: 'onFocus 处理器；开启 hasRovingTabIndex 时保持 roving tab 停留点同步（否则为空操作）。',
    focusFirst: '聚焦第一个可用的可见 treeitem。',
    focusLast: '聚焦最后一个可用的可见 treeitem。',
  },
  usage: {
    description:
      '管理 roving-tabindex 焦点 + WAI-ARIA 树形键盘模型。ArrowUp/Down/Home/End 在可见 treeitem 间线性移动（跳过禁用项）；ArrowRight/Left 承载树语义（展开/折叠，移到第一个子项/父项）。Enter/Space 激活；可打印字符触发 typeahead。',
    bestPractices: [
      { guidance: true, description: '用于层级树组件：把 onToggleExpand 接到展开状态 + onActiveChange 接到唯一 roving tab 停留点。' },
      { guidance: true, description: '把 treeRef + handleKeyDown 都挂到 role="tree" 容器。' },
      { guidance: false, description: '不要用于线性列表（请改用 useListFocus）或二维网格（请改用 useGridFocus）。' },
    ],
  },
};
