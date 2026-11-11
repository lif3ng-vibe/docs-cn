// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useGridFocus',
  displayName: 'useGridFocus',
  keywords: [
    'grid',
    'focus',
    'keyboard',
    'navigation',
    'arrow',
    'calendar',
    'a11y',
    'wai-aria',
    'cells',
    '网格',
    '键盘导航',
    '日历',
  ],
  params: [
    {
      name: 'options',
      type: 'UseGridFocusOptions',
      description: '网格焦点行为的配置对象。',
      required: true,
    },
    {
      name: 'options.columns',
      type: 'number',
      description:
        '网格的列数。用于上/下导航 (每次移动这么多格)。',
      required: true,
    },
    {
      name: 'options.cellSelector',
      type: 'string',
      description:
        '网格内单元格的选择器。应按 DOM 顺序匹配所有单元格位置 (包括禁用/空位)，以保持网格几何。',
      default: '\'button:not([disabled]), [tabindex]:not([tabindex="-1"])\'',
      required: false,
    },
    {
      name: 'options.isCellFocusable',
      type: '(cell: HTMLElement) => boolean',
      description:
        '匹配到的单元格能否接收焦点的判定函数。省略则所有匹配单元格视为可聚焦。',
      required: false,
    },
    {
      name: 'options.getFocusTarget',
      type: '(cell: HTMLElement) => HTMLElement | null',
      description:
        '为单元格解析要聚焦的元素，如 role="gridcell" 包装内的按钮。省略则聚焦单元格本身。',
      required: false,
    },
    {
      name: 'options.onNavigateBefore',
      type: '(column: number, offset: number) => void',
      description:
        '导航将越过第一个单元格时调用的回调。接收列索引与偏移量 (横向为 1，纵向为 columns)。',
      required: false,
    },
    {
      name: 'options.onNavigateAfter',
      type: '(column: number, offset: number) => void',
      description:
        '导航将越过最后一个单元格时调用的回调。接收列索引与偏移量。',
      required: false,
    },
    {
      name: 'options.onPageUp',
      type: '(event: React.KeyboardEvent) => void',
      description:
        'Page Up 键的回调 (如日历中导航到上个月)。接收按键事件，`event.shiftKey` 可选择更大步长，如一年。',
      required: false,
    },
    {
      name: 'options.onPageDown',
      type: '(event: React.KeyboardEvent) => void',
      description:
        'Page Down 键的回调 (如日历中导航到下个月)。接收按键事件，`event.shiftKey` 可选择更大步长，如一年。',
      required: false,
    },
    {
      name: 'options.hasRovingTabIndex',
      type: 'boolean',
      description:
        '在网格上维护单一循环 Tab 停靠点：一个可聚焦单元格 (其解析出的焦点目标) 持有 tabindex="0"，其余为 -1。渲染时盖戳/修复，并随方向键导航移动。把返回的 handleFocus 附加到容器 onFocus。',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'gridRef',
      type: 'React.RefObject<HTMLElement | null>',
      description: '附加到网格容器元素的 ref。',
    },
    {
      name: 'handleKeyDown',
      type: '(e: React.KeyboardEvent) => void',
      description: '附加到网格容器的按键按下处理函数。',
    },
    {
      name: 'handleFocus',
      type: '(e: React.FocusEvent) => void',
      description:
        '网格容器的焦点处理函数。hasRovingTabIndex 启用时保持循环 Tab 停靠点同步；否则无操作，因此始终可安全附加。',
    },
    {
      name: 'focusCell',
      type: '(index: number) => void',
      description: '按索引聚焦特定单元格 (钳制到有效范围)。',
    },
    {
      name: 'focusFirst',
      type: '() => void',
      description: '聚焦网格中第一个可聚焦单元格。',
    },
    {
      name: 'focusLast',
      type: '() => void',
      description: '聚焦网格中最后一个可聚焦单元格。',
    },
  ],
  usage: {
    description:
      '遵循 WAI-ARIA 网格模式，管理二维网格内的键盘导航。支持方向键在单元格间移动，Home/End 到行边界，Ctrl+Home/Ctrl+End 到网格边界，Page Up/Down 触发自定义回调 (如日历中的月份导航)。边界导航回调允许跨网格导航。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于日历日期网格：把 onPageUp/onPageDown 接到月份导航，onNavigateBefore/onNavigateAfter 用于方向键跨月导航。',
      },
      {
        guidance: true,
        description:
          '把 gridRef 与 handleKeyDown 都接到网格容器元素。',
      },
      {
        guidance: true,
        description:
          '循环 tabindex 网格 (如 Calendar)：设 hasRovingTabIndex: true，并把 handleFocus 接到容器 onFocus；预置一个 tabindex=0 的焦点目标，hook 会修复并移动它。',
      },
      {
        guidance: false,
        description:
          '简单线性列表不要用它；一维导航请用 useListFocus。',
      },
    ],
  },
  relatedComponents: ['Calendar'],
  relatedHooks: ['useListFocus', 'useFocusTrap'],
  importPath: '@astryxdesign/core/hooks',
  category: 'focus',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '遵循 WAI-ARIA 网格模式管理二维网格键盘导航。方向键逐格移动，Home/End 到行边界，Ctrl+Home/Ctrl+End 到网格边界，Page Up/Down 触发自定义回调 (如日历月份导航)。边界导航回调允许跨网格导航。',
  paramDescriptions: {
    options: '网格焦点行为配置。',
    'options.columns':
      '网格列数。用于上/下导航 (每次移动这么多格)。',
    'options.cellSelector':
      '按 DOM 顺序的网格单元格选择器 (含禁用/空位)，保持网格几何。',
    'options.isCellFocusable':
      '匹配单元格能否聚焦的判定。省略 = 全部可聚焦。',
    'options.getFocusTarget':
      '为单元格解析要聚焦的元素 (如 gridcell 包装内的按钮)。省略 = 聚焦单元格。',
    'options.onNavigateBefore':
      '导航将越过第一个单元格时的回调。接收列索引 + 偏移 (横向 1，纵向 columns)。',
    'options.onNavigateAfter':
      '导航将越过最后一个单元格时的回调。接收列索引 + 偏移。',
    'options.onPageUp':
      'Page Up 键回调 (如日历上一月)；接收按键事件 (shiftKey → 如一年)。',
    'options.onPageDown':
      'Page Down 键回调 (如日历下一月)；接收按键事件 (shiftKey → 如一年)。',
    'options.hasRovingTabIndex':
      '网格上单一循环 Tab 停靠点 (一个焦点目标 tabindex=0，其余 -1)；渲染时修复 + 随方向键移动。把 handleFocus 接到 onFocus。默认 false。',
  },
  returnDescriptions: {
    gridRef: '附加到网格容器元素的 ref。',
    handleKeyDown: '网格容器的按键按下处理函数。',
    handleFocus:
      '网格容器焦点处理；hasRovingTabIndex 开启时同步循环 Tab 停靠点，否则无操作。',
    focusCell: '按索引聚焦特定单元格 (钳制到有效范围)。',
    focusFirst: '聚焦网格第一个可聚焦单元格。',
    focusLast: '聚焦网格最后一个可聚焦单元格。',
  },
  usage: {
    description:
      '遵循 WAI-ARIA 网格模式管理二维网格键盘导航。方向键逐格移动，Home/End 到行边界，Ctrl+Home/Ctrl+End 到网格边界，Page Up/Down 触发自定义回调 (如日历月份导航)。边界导航回调允许跨网格导航。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于日历日期网格：onPageUp/onPageDown 接月份导航 + onNavigateBefore/onNavigateAfter 用于方向键跨月导航。',
      },
      {
        guidance: true,
        description:
          '把 gridRef + handleKeyDown 都接到网格容器元素。',
      },
      {
        guidance: true,
        description:
          '循环 tabindex 网格 (如 Calendar)：hasRovingTabIndex: true + handleFocus 接 onFocus；预置 tabindex=0 焦点目标，hook 修复并移动它。',
      },
      {
        guidance: false,
        description:
          '简单线性列表不要用它；一维导航请用 useListFocus。',
      },
    ],
  },
};
