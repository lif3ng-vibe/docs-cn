// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ToggleButton',
  displayName: 'Toggle Button',
  group: 'Button',
  category: 'Action',
  keywords: ["toggle","togglebutton","pressed","切换按钮“,”工具栏“,”格式化“,”分段“,”按钮组“,”单选“,”多选"],
  playground: {
    defaults: {
      value: 'option-1',
      label: 'Toggle Group',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-toggle-button-group'},
      {className: 'astryx-toggle-button', states: ['isPressed'], visualProps: ['elevation']},
    ],
  },
  description: '在按压与未按压状态之间切换的按钮。Button 的轻量封装，支持受控切换模式、图标切换与字重强调。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '按钮的无障碍标签。用作可见文本，或作为纯图标按钮的 aria-label。',
      required: true,
    },
    {
      name: 'isPressed',
      type: 'boolean',
      description: '按钮当前是否处于按压状态。对带 value 的 ToggleButtonGroup 成员无效。',
    },
    {
      name: 'onPressedChange',
      type: '(isPressed: boolean, event: MouseEvent) => void',
      description: '按压状态应当变化时同步调用。接收下一个状态与点击事件；调用 event.preventDefault() 可跳过 pressedChangeAction。没有 Action 时，该回调不会产生 Action 等待反馈。对带 value 的 ToggleButtonGroup 成员无效。',
    },
    {
      name: 'pressedChangeAction',
      type: '(isPressed: boolean) => void | Promise<void>',
      description: '基于 API 或导航的切换 Action 处理器，在同步的 onPressedChange 回调之后于 transition 中运行，除非该回调调用了 event.preventDefault()。可以不搭配 onPressedChange 单独使用。等待期间显示乐观按压状态与加载指示器，且仍可被再次点击中断。仅靠回调、无需 Action 等待反馈的切换应省略此 prop。对带 value 的 ToggleButtonGroup 成员无效。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '按钮尺寸。在组内时默认继承组尺寸。',
      default: "'md'",
    },
    {
      name: 'elevation',
      type: "'none' | 'low' | 'med' | 'high'",
      description:
        '浮动（FAB 风格）切换按钮的静态阴影层级（elevation），与 Button 保持一致。`none` 为默认的平面按钮；`low`/`med`/`high` 对应阴影令牌（token）档位。在 ToggleButtonGroup 内同样生效——组内子项保留各自的阴影层级。',
      default: "'none'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '按钮是否禁用。',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '按钮是否显示加载指示器（spinner）。',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '图标元素。提供 icon 而未提供 children 时，按钮变为纯图标模式，并以 label 作为 tooltip。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'isIconOnly',
      type: 'boolean',
      description: '为 true 时渲染为方形纯图标按钮，以 `label` 作为 aria-label，并根据标签自动生成 tooltip。',
      default: 'false',
    },
    {
      name: 'pressedIcon',
      type: 'ReactNode',
      description: '按压状态下显示的图标。未提供时回退到 icon。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '可见内容。与 icon 搭配且省略时，按钮变为纯图标模式。',
    },
    {
      name: 'tooltip',
      type: 'string',
      description: '悬停时显示的 tooltip 文本。',
    },
    {
      name: 'value',
      type: 'string',
      description: '在 ToggleButtonGroup 内使用时的值标识。组内必填。',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: '供自动化测试框架使用的测试选择器。',
    },
  ],
  components: [
    {name: 'ToggleButtonGroup'},
  ],
  usage: {
    description:
      'ToggleButton 在选中与未选中状态之间切换，表达持久的开/关选择。可单独用于加粗、静音、收藏等二元操作，也可放入 ToggleButtonGroup 构成单选或多选的工具栏控件。',
    accessibility: [
      {
        name: 'Text label',
        category: 'Color contrast',
        criterion: '1.4.3 Contrast (Minimum)',
        requirement: '4.5:1',
        states: ['Unselected', 'Selected', 'Hover', 'Pointer down'],
        description:
          '选中与未选中状态下，标签与按钮背景的对比度至少为 4.5:1。Hover 与 Pointer down 状态需在叠加层应用后测量最终背景。',
      },
      {
        name: 'Essential icon or spinner arc',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Icon only', 'Loading'],
        description:
          '纯图标 ToggleButton 的图标与按钮背景对比度至少为 3:1。旋转的加载指示器弧线同样须达到 3:1。可见标签旁的图标无需单独检查。',
      },
      {
        name: 'Selected state indicator',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1 if relied upon',
        states: ['Selected'],
        description:
          '仅当用户需要靠选中背景区分选中与未选中时，背景才须达到 3:1。标签字重或图标变化也可以表达选中态。',
      },
      {
        name: 'Visible control boundary',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1 if needed',
        states: ['Rest'],
        description:
          '仅当用户需要靠按钮边界识别控件时，边界才须达到 3:1 对比度。可见的标签或图标也可以承担这一职责。',
      },
      {
        name: 'Keyboard focus indicator',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Focus visible'],
        description:
          '焦点环与按钮周围区域的对比度至少为 3:1。选中与未选中两种状态都要检查。',
      },
      {
        name: 'Disabled appearance',
        category: 'Color contrast',
        criterion: '1.4.3 and 1.4.11 exceptions',
        requirement: 'Not required',
        states: ['Disabled'],
        description:
          '禁用控件无需满足上述对比度要求。',
      },
    ],
    bestPractices: [
      {guidance: true, description: '按压态使用填充或着色图标，让用户一眼看出当前状态：例如描边星形与实心星形的对比。'},
      {guidance: true, description: '按压与未按压状态下保持标签一致。用视觉处理（图标、字重、背景）传达状态变化。'},
      {guidance: true, description: '用带无障碍标签的 ToggleButtonGroup 包裹相关切换按钮，让屏幕阅读器将它们播报为一组关联控件。'},
      {guidance: false, description: '不要将 ToggleButton 用于“提交”或“删除”等一次性操作；那些是普通 Button，而非切换按钮。'},
      {guidance: false, description: '不要在同一组内混用 ToggleButton 与普通 Button；ToggleButtonGroup 内只应使用 ToggleButton。'},
      {guidance: false, description: '不要将 ToggleButton 用于跨会话持久的开/关设置；请改用 Switch，它更能传达“设置”语义。'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: '代表切换操作的前置图标，例如收藏用的星形或格式化用的加粗 “B”。'},
      {name: 'Pressed icon', required: false, description: '按压时显示的替换图标：通常是默认图标的填充版本，以强化激活状态。'},
      {name: 'Label', required: true, description: '可见文本或无障碍名称。纯图标切换按钮中用作 aria-label 与自动 tooltip。'},
      {name: 'Spinner', required: false, description: '在 pressedChangeAction 触发的异步操作期间替换图标显示。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'ToggleButton switches between selected and unselected states to represent a persistent on/off choice. Use it standalone for binary actions like bold, mute, or favorite, or inside a ToggleButtonGroup for single-select or multi-select toolbar controls.',
    bestPractices: [
      {guidance: true, description: 'Use a filled or colored icon for the pressed state so users can see the current state at a glance: an outline star vs a solid star, for example.'},
      {guidance: true, description: 'Keep the label identical between pressed and unpressed states. Let the visual treatment (icon, weight, background) communicate the change.'},
      {guidance: true, description: 'Wrap related toggles in a ToggleButtonGroup with an accessible label so screen readers announce them as a connected set.'},
      {guidance: false, description: "Don't use a ToggleButton for one-time actions like \"Submit\" or \"Delete\"; those are regular Buttons, not toggles."},
      {guidance: false, description: "Don't mix ToggleButtons with regular Buttons inside the same group; use only ToggleButtons in a ToggleButtonGroup."},
      {guidance: false, description: "Don't use a ToggleButton for on/off settings that persist across sessions; use a Switch instead, which better communicates \"setting\" semantics."},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'A leading icon that represents the toggle action, like a star for favorite or bold "B" for formatting.'},
      {name: 'Pressed icon', required: false, description: 'An alternate icon shown when pressed: typically a filled version of the default icon to reinforce the active state.'},
      {name: 'Label', required: true, description: 'The visible text or accessible name. For icon-only toggles, used as the aria-label and auto-tooltip.'},
      {name: 'Spinner', required: false, description: 'Replaces the icon during async operations triggered by pressedChangeAction.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '切换按钮：支持按压/未按压状态、图标切换，可集成到按钮组实现单选/多选',
  usage: {
    description:
      'ToggleButton 在选中/未选中之间切换，表达持久的开/关选择。单独用于二元操作，或放入 ToggleButtonGroup 构成单选/多选工具栏控件。',
    bestPractices: [
      {guidance: true, description: '按压态用填充/着色图标，让用户一眼看出当前状态。'},
      {guidance: true, description: '各状态下标签保持一致，用视觉处理传达变化。'},
      {guidance: true, description: '相关切换按钮包进带无障碍标签的 ToggleButtonGroup。'},
      {guidance: false, description: '不要用 ToggleButton 做一次性操作；提交/删除用普通 Button。'},
      {guidance: false, description: '不要在同一组内混用 ToggleButton 与普通 Button。'},
      {guidance: false, description: '持久设置不要用 ToggleButton；请改用 Switch。'},
    ],
  },
};
