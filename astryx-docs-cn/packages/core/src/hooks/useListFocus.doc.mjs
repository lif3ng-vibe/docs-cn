// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useListFocus',
  displayName: 'useListFocus',
  keywords: [
    'list',
    '列表',
    'focus',
    '焦点',
    'keyboard',
    '键盘导航',
    'menu',
    'toolbar',
    'roving',
    'tabindex',
    'a11y',
    'arrow',
    'wai-aria',
  ],
  params: [
    {
      name: 'options',
      type: 'UseListFocusOptions',
      description:
        '列表焦点行为的配置对象。所有字段均为可选。',
      required: false,
    },
    {
      name: 'options.itemSelector',
      type: 'string',
      description: '列表内可聚焦项的选择器。',
      default: '\'[role="menuitem"]\'',
      required: false,
    },
    {
      name: 'options.boundarySelector',
      type: 'string',
      description:
        "标识列表边界的选择器，用于包含同类嵌套列表的列表（如带子菜单浮层的菜单）。设置后，项收集与按键处理都限定在该层自己的容器内。通常为 '[role=\"menu\"]'.",
      required: false,
    },
    {
      name: 'options.wrap',
      type: 'boolean',
      description: '方向键导航到两端时是否循环。',
      default: 'true',
      required: false,
    },
    {
      name: 'options.onEscape',
      type: '() => void',
      description:
        '按下 Escape 键时的回调（如关闭菜单）。提供该回调也会消费按键（preventDefault）；不提供时 Escape 会穿透到外层。',
      required: false,
    },
    {
      name: 'options.orientation',
      type: "'horizontal' | 'vertical' | 'both'",
      description:
        "导航方向。'horizontal' 使用 ArrowLeft/ArrowRight，'vertical' 使用 ArrowUp/ArrowDown，'both' 接受全部四个方向键。",
      default: "'vertical'",
      required: false,
    },
    {
      name: 'options.hasHomeEnd',
      type: 'boolean',
      description: 'Home/End 是否跳到第一个/最后一个可用项。',
      default: 'true',
      required: false,
    },
    {
      name: 'options.hasPaging',
      type: 'boolean',
      description:
        'PageDown/PageUp 是否在可滚动列表中翻页：PageDown 移到容器内最后一个完全可见的可用项，在该处再按一次则前进一个视口；PageUp 与之镜像。两者都不循环；在不可滚动的列表中相当于 End/Home。',
      default: 'false',
      required: false,
    },
    {
      name: 'options.hasRovingTabIndex',
      type: 'boolean',
      description:
        '启用 roving-tabindex 管理：hook 会设置单一 tab 停留点（一项 tabindex="0"，其余为 -1），在项挂载/卸载或切换禁用态时修复它，并随方向键导航移动。为 false 时，hook 只移动焦点，从不改动 tabindex。',
      default: 'false',
      required: false,
    },
    {
      name: 'options.hasCaretGuard',
      type: 'boolean',
      description:
        '为 true 时，不会从嵌套的文本 input/textarea 抢走方向键——只要其光标未处于行进方向的边界（或存在选区），也从不从嵌套的 contenteditable（富文本编辑器/聊天输入框）抢走。保护列表内的行内文本编辑。',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'listRef',
      type: 'React.RefObject<HTMLElement | null>',
      description: '挂到列表容器元素上的 ref。',
    },
    {
      name: 'handleKeyDown',
      type: '(e: React.KeyboardEvent) => void',
      description: '挂到列表容器上的按键按下处理器。',
    },
    {
      name: 'handleFocus',
      type: '(e: React.FocusEvent) => void',
      description:
        '容器的焦点处理器。启用 hasRovingTabIndex 时保持 roving tab 停留点同步；否则为空操作，因此始终可以安全挂载。',
    },
    {
      name: 'focusItem',
      type: '(index: number) => void',
      description: '按索引聚焦特定项（钳制到有效范围）。',
    },
    {
      name: 'focusFirst',
      type: '() => boolean',
      description:
        '聚焦第一个可用项。成功聚焦时返回 true。',
    },
    {
      name: 'focusLast',
      type: '() => boolean',
      description:
        '聚焦最后一个可用项。成功聚焦时返回 true。',
    },
    {
      name: 'ownsEvent',
      type: '(e: React.KeyboardEvent) => boolean',
      description:
        '判断按键事件属于本列表层，而不是共享同一 boundarySelector 的嵌套列表。未设置 boundarySelector 时始终为 true。用于保护使用方自行添加的按键处理（Enter/Space、typeahead）。',
    },
    {
      name: 'getItems',
      type: '() => HTMLElement[]',
      description:
        "本层的可聚焦项，按 DOM 顺序排列（已按 boundarySelector 限定）。用它构建 typeahead 目标，而不要重新查询。",
    },
  ],
  usage: {
    description:
      '按照 WAI-ARIA 菜单/列表框/工具栏模式管理线性列表内的键盘导航。支持方向键导航（垂直、水平或双向）、Home/End 边界跳转、可选循环、RTL 以及 Escape 关闭。对于拥有单一 tab 停留点的组合部件（工具栏、分段控件、标签条），可启用 hasRovingTabIndex。适用于下拉菜单、工具栏以及任何一维可聚焦列表。',
    bestPractices: [
      {
        guidance: true,
        description:
          "工具栏和标签栏把 orientation 设为 'horizontal'，下拉菜单设为 'vertical'。",
      },
      {
        guidance: true,
        description:
          '为菜单/下拉框提供 onEscape 回调，把焦点还给触发器。',
      },
      {
        guidance: true,
        description:
          '对应作为单一 tab 停留点的工具栏式组合部件，启用 hasRovingTabIndex（若组件可包含文本输入，再启用 hasCaretGuard）。',
      },
      {
        guidance: false,
        description:
          '不要用于二维网格导航；网格与日历请改用 useGridFocus。',
      },
    ],
  },
  relatedComponents: ['TabMenu', 'Toolbar'],
  relatedHooks: ['useGridFocus', 'useFocusTrap'],
  importPath: '@astryxdesign/core/hooks',
  category: 'focus',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '按照 WAI-ARIA 菜单/列表框/工具栏模式管理线性列表内的键盘导航。支持方向键导航（垂直/水平）、Home/End 边界跳转、可选循环、Escape 关闭。适用于下拉菜单、工具栏以及任何一维可聚焦列表。',
  paramDescriptions: {
    options: '列表焦点行为的配置。所有字段可选。',
    'options.itemSelector': '列表内可聚焦项的选择器。',
    'options.boundarySelector':
      '包含嵌套列表的列表（如子菜单浮层）的边界选择器；把项收集与按键处理限定到本层。',
    'options.wrap': '方向键导航到两端时是否循环。',
    'options.onEscape':
      '按下 Escape 键时的回调（如关闭菜单）。同时会消费该按键；不提供时 Escape 穿透到外层。',
    'options.orientation':
      "导航方向。'horizontal' 用 ArrowLeft/ArrowRight，'vertical' 用 ArrowUp/ArrowDown，'both' 接受全部四个方向键。",
    'options.hasHomeEnd': 'Home/End 是否跳到第一个/最后一个可用项。',
    'options.hasPaging':
      'PageDown/PageUp 是否在可滚动列表中翻页（最后一个/第一个完全可见项，再按一次前进一个视口；不循环）。',
    'options.hasRovingTabIndex':
      '启用 roving-tabindex 管理：hook 在各项间设置并修复单一 tab 停留点。',
    'options.hasCaretGuard':
      "为 true 时，不从光标在行中的嵌套文本 input/textarea 或 contenteditable 抢走方向键。",
  },
  returnDescriptions: {
    listRef: '挂到列表容器元素上的 ref。',
    handleKeyDown: '列表容器的按键按下处理器。',
    handleFocus:
      '焦点处理器；开启 hasRovingTabIndex 时保持 roving tab 停留点同步（否则为空操作）。',
    focusItem: '按索引聚焦特定项（钳制到有效范围）。',
    focusFirst: '聚焦第一个可用项；成功时返回 true。',
    focusLast: '聚焦最后一个可用项；成功时返回 true。',
    ownsEvent:
      "判断按键事件属于本层还是共享 boundarySelector 的嵌套列表；未设置时始终为 true。",
    getItems:
      "本层的可聚焦项，按 DOM 顺序，已按 boundarySelector 限定。",
  },
  usage: {
    description:
      '按照 WAI-ARIA 菜单/列表框/工具栏模式管理线性列表内的键盘导航。支持方向键导航（垂直/水平）、Home/End 边界跳转、可选循环、Escape 关闭。适用于下拉菜单、工具栏以及任何一维可聚焦列表。',
    bestPractices: [
      {
        guidance: true,
        description:
          "工具栏 + 标签栏把 orientation 设为 'horizontal'，下拉菜单设为 'vertical'。",
      },
      {
        guidance: true,
        description:
          '为菜单/下拉框提供 onEscape 回调，把焦点还给触发器。',
      },
      {
        guidance: true,
        description:
          '对应作为单一 tab 停留点的工具栏式组合部件，启用 hasRovingTabIndex（组件可含文本输入时再加 hasCaretGuard）。',
      },
      {
        guidance: false,
        description:
          '不要用于二维网格导航；网格 + 日历请改用 useGridFocus。',
      },
    ],
  },
};
