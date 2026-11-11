// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TabBar',
  displayName: 'Tab Bar',
  category: 'Navigation',
  keywords: [
    'tabbar',
    'tab bar',
    '标签栏',
    'bottom tabs',
    '底部标签',
    'bottom navigation',
    '底部导航',
    'bottom bar',
    '底栏',
    'tab bar controller',
    'mobile navigation',
    '移动端导航',
    'app sections',
    '应用分区',
    'badge',
    '徽标',
    'TabBar',
  ],
  description:
    '手机应用的底部标签栏，如同 iOS 26：应用的顶层分区呈现为悬浮在底边之上的胶囊，带一个滑向所选标签的选中透镜。每个标签有图标、标签文字和可选徽标。在手指下，iOS 与 Android 表现一致，如同 iOS 26：手指落下载入时透镜浮起成玻璃质感，跟随在标签间拖动的手指，并在抬起位置最近的标签上落定，同时整栏弹性伸缩；鼠标下按压就是普通的按钮按压：单击选择标签，透镜按主题动效跟随。没有选中标签时，按住手指会高亮其下方的标签。再次选择已选中的标签会单独上报，让屏幕可以像 iOS 一样回到其根视图。实验性：先在 lab 落地。',
  components: [
    {
      name: 'TabBar',
      displayName: 'Tab Bar',
      description:
        '标签栏本体。它固定在视口底部、覆盖在页面之上，因此请在滚动内容底部留出 83 px 空间，并在 LayerProvider 上声明（inset={{blockEnd: 83}}），让菜单、popover 和 toast 避开它。选中由你掌控：传入所选标签的 value，并在 onChange 中更新。',
      props: [
        {
          name: 'value',
          type: 'string',
          description: '所选标签的 value。',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description:
            '选择了不同标签时以该标签的 value 调用：手指在其上方抬起（轻点或在栏上拖动之后）、单击，或聚焦标签上按 Enter 或 Space。',
          required: true,
        },
        {
          name: 'onReselect',
          type: '(value: string) => void',
          description:
            '再次选择当前选中标签时以其 value 调用，例如把该标签的导航栈回到根视图，如同 iOS。',
        },
        {
          name: 'label',
          type: 'string',
          description:
            '为辅助技术命名标签栏。缺少它、或 aria-label 或 aria-labelledby（优先级更高，直接作用到标签列表）时，标签列表以阅读器语言的 "Tabs" 命名。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '标签：按顺序排列的 TabBarItem 元素，作为直接子组件。',
          required: true,
        },
      ],
    },
    {
      name: 'TabBarItem',
      displayName: 'Tab Bar Item',
      description:
        '单个标签：其 value、标签文字、图标和徽标。TabBar 读取其 prop 并负责绘制；它自身不渲染任何内容。',
      props: [
        {
          name: 'value',
          type: 'string',
          description: '在 value、onChange 和 onReselect 中标识该标签。',
          required: true,
        },
        {
          name: 'label',
          type: 'string',
          description:
            '标签名称，显示在图标下方。保持一个简短词。',
          required: true,
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description:
            '标签图标，size lg 的 Icon。以当前文字颜色绘制，选中时以强调色绘制。',
          required: true,
        },
        {
          name: 'selectedIcon',
          type: 'ReactNode',
          description:
            '标签选中时的图标，通常是其填充变体。默认为 icon。',
        },
        {
          name: 'badge',
          type: 'string | number',
          description:
            '图标尾部上角的徽标：数字或短字符串如 "!"。出现、变化和消失不带动画。省略或传空字符串表示没有徽标。',
        },
        {
          name: 'badgeLabel',
          type: 'string',
          description:
            '辅助技术在标签文字之后为徽标朗读的内容，如 "3 unread"。默认为徽标本身。',
        },
        {
          name: 'panelId',
          type: 'string',
          description:
            '该标签控制的面板 id，接为 aria-controls。把同一 id 放在该分区的面板元素上。',
        },
        {
          name: 'aria-disabled',
          type: "boolean | 'true' | 'false'",
          description:
            '禁用标签，如同 Core 的 Tab：保持可聚焦但变暗，且永不被选中。在它上面轻点、单击或按键、或在其上方抬起都不会选中任何东西，方向键跳过它。落在其上的手指不会让透镜浮起，直到拖动或到达一个可用标签，抬起时选择后者。这是有意与 iOS 不同。iOS 忽略从禁用标签开始的触摸，而 TabBar 遵循操作组规则：抬起时所在的标签执行动作。',
        },
      ],
    },
  ],
  usage: {
    description:
      '在手机上用 TabBar 在应用的三个到五个顶层分区之间切换，每个分区保持自己的状态和导航栈。把每个分区的导航栈保存在应用中，并在 onReselect 中把它回到根视图。',
    bestPractices: [
      {
        guidance: true,
        description:
          '每个标签保持可见、集合保持稳定；给每个标签一个简短文字和轮廓图标，配填充版 selectedIcon。',
      },
      {
        guidance: true,
        description:
          '用徽标标记该分区中需要关注的事物（如未读项），并在 badgeLabel 中说明它计的是什么。',
      },
      {
        guidance: true,
        description:
          '给每个标签一个命名其分区面板的 panelId，让辅助技术把两者关联起来。',
      },
      {
        guidance: true,
        description:
          '仅当分区无法打开时才禁用标签，并让它留在原位，其他标签不移动。',
      },
      {
        guidance: false,
        description:
          '不要用于操作、单屏内的过滤器（用 SegmentedControl）或页面内标签（用 TabList）。',
      },
    ],
  },
};
