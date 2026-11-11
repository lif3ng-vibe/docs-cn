// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'NavigationStack',
  displayName: 'Navigation Stack',
  category: 'Navigation',
  keywords: [
    'navigationstack',
    'navigation stack',
    '导航栈',
    'stack navigator',
    'drill down',
    '逐级下钻',
    'push',
    '入栈',
    'pop',
    '出栈',
    'back swipe',
    '边缘滑动返回',
    'navigation controller',
    'master detail',
    '主从结构',
    'mobile navigation',
    '移动端导航',
    'NavigationStack',
  ],
  description:
    '手机布局的逐级下钻导航：每个屏幕把下一屏推到顶层，Back、屏幕边缘或内容任意位置的反向滑动返回上一屏。入栈、出栈和反向滑动的动效与 iOS 一致：新屏从尾部边缘滑入并盖在旧屏上，旧屏滑过三分之一距离并带轻微变暗；松手的滑动按距离与速度决定完成或弹回。入栈从不等待动画：新屏一开始滑入即可使用。开启 Reduce Motion 时屏幕改为交叉淡入淡出。实验性：先在 lab 落地。',
  components: [
    {
      name: 'NavigationStack',
      displayName: 'Navigation Stack',
      description:
        '导航器。路径由你掌控：传入推在根屏幕上的条目，并在 onPathChange 中更新。栈渲染根屏幕和每个条目一个屏幕，顶层最后渲染，保持被覆盖屏幕及其滚动位置存活，并将其设为 inert。栏显示顶层屏幕的标题、其末尾内容，以及一个带尖角号（chevron）的圆形 Back 按钮，按钮以它返回的屏幕命名。入栈把焦点移到新屏标题；出栈把焦点还给推入该屏的控件。在手指下，栏不绘制背景和发丝线，如同 iOS 26。一旦屏幕内容在栏下移动了 10px，该屏顶部淡入一层正文色的遮罩。每屏的遮罩在入栈、出栈或反向滑动时保持各自独立。鼠标下栏保持其表面和发丝线。',
      props: [
        {
          name: 'root',
          type: 'ReactElement<NavigationScreenProps>',
          description:
            '根屏幕，一个 NavigationScreen。没有 Back 按钮。',
          required: true,
        },
        {
          name: 'path',
          type: 'ReadonlyArray<T>',
          description:
            '推在根上的条目，底部在前。在末尾追加一条即推入其屏幕；移除最后一条即弹出；一次移除多条则直接回退到新的顶层。',
          required: true,
        },
        {
          name: 'onPathChange',
          type: '(path: T[]) => void',
          description:
            '屏幕入栈或出栈（useNavigationStack）、按下 Back，或反向滑动越过不可回退点后松手时，以新路径调用。',
          required: true,
        },
        {
          name: 'renderScreen',
          type: '(entry: T, index: number) => ReactElement<NavigationScreenProps>',
          description: '为条目渲染屏幕：一个 NavigationScreen。',
          required: true,
        },
        {
          name: 'getKey',
          type: '(entry: T, index: number) => string | number',
          description:
            '每条目的稳定 key，让屏幕在其他屏幕压入时保持自身状态。默认取条目位置。',
        },
        {
          name: 'isInteractivePopEnabled',
          type: 'boolean',
          description:
            '反向滑动是否触发弹出：内容任意位置的横向拖动，适用于任何指针（手指、手写笔或鼠标拖动）；从主屏幕打开的 web 应用中还包括从屏幕首端边缘的手指滑动。在浏览器标签页中该边缘仍是浏览器自身的返回滑动；在 Android 上系统返回键拥有两个屏幕边缘。',
          default: 'true',
        },
        {
          name: 'label',
          type: 'string',
          description: '导航器区域的无障碍名称。',
        },
      ],
    },
    {
      name: 'NavigationScreen',
      displayName: 'Navigation Screen',
      description:
        'NavigationStack 的一屏：其标题、Back 在其后推入屏幕上显示的标题、其末尾内容和内容。由 NavigationStack 的 root 和 renderScreen 返回；自身不渲染任何内容。',
      props: [
        {
          name: 'title',
          type: 'string',
          description:
            '屏幕在顶层时显示在栏中，到达时最先被朗读。',
          required: true,
        },
        {
          name: 'backTitle',
          type: 'string',
          description:
            '在其上推入的屏幕中 Back 朗读的内容。默认为 title。',
        },
        {
          name: 'titleDisplayMode',
          type: "'large' | 'inline'",
          description:
            "标题的显示方式。'large' 把标题以大号粗体放在内容上方，随内容滚动；一旦滚到栏下，栏改为显示该标题。用于顶层屏幕，如同 iOS。",
          default: "'inline'",
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            '屏幕在顶层时栏末尾的内容。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '屏幕内容。独立滚动，被覆盖时保持滚动位置。',
        },
      ],
    },
  ],
  usage: {
    description:
      '在手机上做层级下钻时使用 NavigationStack：设置列表、文件夹、列表及其详情。在屏幕内用 useNavigationStack 从某一行调用 push。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把 path 保存在应用状态（或 URL）中，并为条目提供稳定 key，让屏幕在栈变化时保持状态。',
      },
      {
        guidance: true,
        description:
          '从用户激活的控件发起入栈（某行的 onClick）：屏幕弹出时焦点回到它。',
      },
      {
        guidance: false,
        description:
          '不要用于人们在顶层切换的分区；那类场景用标签页或侧边栏，各自维护自己的栈。',
      },
    ],
  },
};
