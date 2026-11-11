// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ButtonGroup',
  displayName: 'Button Group',
  group: 'Button',
  category: 'Action',
  keywords: ["button-group","连接式","拆分","工具栏","操作","分组","按钮"],
  playground: {
    defaults: {
      label: '操作',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-button-group', visualProps: ['size', 'orientation', 'elevation']},
    ],
  },
  components: [
    {
      name: 'ButtonGroup',
      displayName: 'Button Group',
      description: '将多个按钮组合在一起，带有连接样式：共享边框、正确的圆角处理（仅外边缘），以及水平或垂直方向。在触摸呈现下，按下时按钮组像菜单一样跟踪按压：按下一个按钮并滑过其他按钮，高亮随之移动。松开时所在的按钮执行，在组外松开则什么都不执行。鼠标按下与原生按钮相同。使用手指时，每个按钮的触控目标向 44 px 扩展，最多到与相邻按钮间距的一半，按钮本身不变大。组内的菜单触发器保留自己的打开方式。',
      props: [
        {name: 'children', type: 'ReactNode', description: 'Button 或 IconButton 子元素。', required: true, slotElements: [{__element: 'Button', props: {label: '操作'}}]},
        {name: 'label', type: 'string', description: '按钮组的无障碍标签 (aria-label)。', required: true},
        {name: 'orientation', type: "'horizontal' | 'vertical'", description: '按钮组的布局方向。', default: "'horizontal'"},
        {name: 'size', type: "'sm' | 'md' | 'lg'", description: '组内按钮的默认尺寸。单个按钮可覆盖。', default: "'md'"},
        {name: 'isDisabled', type: 'boolean', description: '组内所有按钮是否禁用。', default: 'false'},
        {name: 'elevation', type: "'none' | 'low' | 'med' | 'high'", description: '整个组的静止阴影深度。连接的按钮共享一个表面，阴影将它们作为整体抬起。用于悬浮于内容之上的组。', default: "'none'"},
        {name: 'ref', type: 'React.Ref<HTMLDivElement>', description: '转发到根元素的 ref。'},
        {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX 样式，用于布局自定义。必须是 stylex.create() 的值。'},
        {name: 'data-testid', type: 'string', description: '自动化测试的选择器。'},
      ],
    },
  ],
  usage: {
    description:
      'ButtonGroup 把相关操作连接成单一控件。当多个按钮表示视觉上应归属一体的相关选择或操作时使用，如复制/剪切/粘贴，或撤销/重做。',
    accessibility: [
      {
        name: 'Text label',
        category: 'Color contrast',
        criterion: '1.4.3 Contrast (Minimum)',
        requirement: '4.5:1',
        states: ['静止', '悬停', '按下'],
        description:
          '每种状态下每个按钮文本与其背景的对比度至少 4.5:1。悬停与按下时，测量叠加层应用后的最终背景。',
      },
      {
        name: 'Essential icon or spinner arc',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['仅图标', '加载中'],
        description:
          '代替文本的图标与按钮背景对比度至少 3:1；旋转的加载弧线同样须达 3:1。可见标签旁的图标无需单独检查。',
      },
      {
        name: 'Visible control boundary',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '需要时 3:1',
        states: ['静止'],
        description:
          '某些组需要分隔线或边界来区分每个按钮。该分隔线或边界的对比度至少 3:1。',
      },
      {
        name: 'Keyboard focus indicator',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['聚焦可见'],
        description:
          '焦点轮廓与其周围区域的对比度至少 3:1。',
      },
      {
        name: 'Disabled appearance',
        category: 'Color contrast',
        criterion: '1.4.3 and 1.4.11 exceptions',
        requirement: '不要求',
        states: ['禁用'],
        description:
          '禁用控件无需满足这些对比度要求。',
      },
    ],
    bestPractices: [
      {guidance: true, description: '将对同一对象执行相关操作的按钮分组，如对选中文本的复制、剪切、粘贴。'},
      {guidance: true, description: '组内所有按钮使用相同的变体，使其看起来像一个连接的整体。'},
      {guidance: true, description: '保持组较小（2-4 个按钮）。更多操作请使用工具栏或下拉菜单。'},
      {guidance: false, description: '不要混合差异很大的操作，将保存按钮和删除按钮放在同一组中会令人困惑。'},
      {guidance: false, description: '不要使用 ButtonGroup 进行导航，使用 SegmentedControl 或 TabList 切换视图。'},
      {guidance: false, description: '不要嵌套 ButtonGroup。如需多个组，请并排放置并留有间隔。'},
      {guidance: true, description: '按钮组的标签应说明这些按钮作用于什么。该标签是按钮组的无障碍名称，屏幕阅读器会在每个成员之前朗读它。'},
      {guidance: true, description: '保持按钮组为单个 Tab 停靠点。方向键沿排列方向在成员间移动，Home/End 跳到首尾。这是 WAI-ARIA APG 的 roving tabindex 技术：https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex'},
      {guidance: false, description: '不要用禁用整个按钮组来表示操作进行中。请保持按钮组可用，并在发起操作的按钮上显示进度。'},
    ],
    anatomy: [
      {name: 'Button', required: true, description: '一个或多个 Button 或 IconButton 子元素，形成连接的组。'},
      {name: 'Divider', required: false, description: '按钮之间的细边框，由组自动渲染。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  components: [
    {
      name: 'ButtonGroup',
      displayName: 'Button Group',
      description: '将多个按钮组合在一起，带有连接样式：共享边框、正确的圆角处理（仅外边缘），以及水平或垂直方向。在触摸呈现下（主要指针为粗指针时），按下时按钮组像菜单一样跟踪按压：按下一个按钮并滑过其他按钮，高亮随之移动。松开时所在的按钮执行，在组外松开则什么都不执行。鼠标按下与原生按钮相同。使用手指时，每个按钮的触控目标向 44 px 扩展，最多到与相邻按钮间距的一半，按钮本身不变大。组内的菜单触发器保留自己的打开方式。',
      propDescriptions: {
        children: 'Button 或 IconButton 子元素。',
        label: '按钮组的无障碍标签 (aria-label)。',
        orientation: '按钮组的布局方向。',
        size: '组内按钮的默认尺寸。单个按钮可覆盖。',
        isDisabled: '组内所有按钮是否禁用。',
        elevation: '整个组的静止阴影深度。连接的按钮共享一个表面，阴影将它们作为整体抬起。',
        ref: '转发到根元素的引用。',
        xstyle: 'StyleX 样式，用于布局自定义。必须是 stylex.create() 的值。',
        'data-testid': '自动化测试的选择器。',
      },
    },
  ],
  usage: {
    description:
      'ButtonGroup 将相关操作连接成一个控件。当多个按钮表示对同一对象的相关操作时使用，如复制/剪切/粘贴，或撤销/重做。',
    bestPractices: [
      {guidance: true, description: '将对同一对象执行相关操作的按钮分组，如对选中文本的复制、剪切、粘贴。'},
      {guidance: true, description: '组内所有按钮使用相同的变体，使其看起来像一个连接的整体。'},
      {guidance: true, description: '保持组较小（2-4 个按钮）。更多操作请使用工具栏或下拉菜单。'},
      {guidance: false, description: '不要混合差异很大的操作，将保存按钮和删除按钮放在同一组中会令人困惑。'},
      {guidance: false, description: '不要使用 ButtonGroup 进行导航，使用 SegmentedControl 或 TabList 切换视图。'},
      {guidance: false, description: '不要嵌套 ButtonGroup。如需多个组，请并排放置并留有间隔。'},
      {guidance: true, description: '按钮组的标签应说明这些按钮作用于什么。该标签是按钮组的无障碍名称，屏幕阅读器会在每个成员之前朗读它。'},
      {guidance: true, description: '按钮组是单个 Tab 停靠点。方向键沿排列方向在成员间移动焦点，Home/End 跳到首尾，禁用成员会被跳过——即 WAI-ARIA APG 的 roving tabindex 技术。'},
      {guidance: false, description: '不要用禁用整个按钮组来表示操作进行中。请保持按钮组可用，并在发起操作的按钮上显示进度。'},
    ],
    anatomy: [
      {name: '按钮', required: true, description: '一个或多个 Button 或 IconButton 子元素，形成连接的组。'},
      {name: '分隔线', required: false, description: '按钮之间的细边框，由组自动渲染。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '连接式按钮组：共享边框、仅外侧圆角、水平/垂直',
  usage: {
    description:
      'ButtonGroup 把相关操作连接成单一控件。用于对同一对象的相关操作。',
    bestPractices: [
      {guidance: true, description: '对同一对象分组相关操作：复制/剪切/粘贴、撤销/重做。'},
      {guidance: true, description: '所有按钮同变体，看起来是一体。'},
      {guidance: true, description: '组保持小（2-4 个按钮）；更多操作用 Toolbar 或 DropdownMenu。'},
      {guidance: false, description: '不要在一个组里混入无关操作。'},
      {guidance: false, description: '不要用于导航；用 SegmentedControl 或 TabList。'},
      {guidance: false, description: '不要嵌套 ButtonGroup。'},
      {guidance: true, description: '组标签说明按钮作用对象；它即无障碍名称。'},
      {guidance: true, description: '单个 Tab 停靠点；方向键在成员间移动，Home/End 到首尾（APG roving tabindex）。'},
      {guidance: true, description: '触摸呈现下按压像菜单一样跟踪：滑过其他按钮，松开所在按钮执行，组外松开不执行。鼠标按下与原生按钮相同。手指触控目标向 44 px 扩展，最多到相邻间距的一半；菜单触发器保留自己的打开方式。'},
      {guidance: false, description: '不要为进行中的操作禁用整组；在发起按钮上显示进度。'},
    ],
  },
  components: [
    {
      name: 'ButtonGroup',
      displayName: 'Button Group',
      description: '连接式按钮组：共享边框、仅外侧圆角',
      propDescriptions: {
        children: 'Button 或 IconButton 子元素',
        label: '无障碍标签 (aria-label)',
        orientation: '布局方向',
        size: '按钮默认尺寸；单个按钮可覆盖',
        isDisabled: '禁用所有按钮',
        elevation: '整组的静止阴影深度：none|low|med|high',
        xstyle: 'StyleX 布局样式；必须是 stylex.create() 的值',
        'data-testid': '测试选择器',
      },
    },
  ],
};
