// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatVirtualizer',
  subComponentOf: 'Chat',
  group: 'Chat',
  category: 'Chat',
  displayName: 'Chat Virtualizer',
  description:
    '面向长会话记录的窗口化消息列表：只渲染视口附近的行，其余用两个占位（spacer）元素表示，因此上千条消息的线程只消耗一个视口的 DOM。行保持在正常文档流中。手指滚动列表期间，位置修正写入占位高度而非跳写 scrollTop，因此手指下的内容不会移动；该次滚动结束后修正落定。触摸手势之外，列表直接写入 scrollTop。默认跟随最新消息，用户滚动落在距底部 endThreshold 以内时重新接管跟随。可自建滚动容器，也可嵌套进调用方已有的容器（见 scrollElement）。',
  props: [
    {
      name: 'data',
      type: 'readonly T[]',
      description:
        '要渲染的行，最旧在前。变更通过引用比较检测，因此请替换数组而不是原地修改——原地修改会让几何信息失效。',
      required: true,
    },
    {
      name: 'getRowKey',
      type: '(item: T, index: number) => string',
      description:
        '每行的稳定标识，经 String() 转换。尺寸缓存与运行时尺寸均值都以它为键，因此从下标派生键会在列表位移时丢弃全部测量结果。',
      required: true,
    },
    {
      name: 'renderItem',
      type: '(info: {item: T; index: number}) => ReactNode',
      description:
        '渲染单行。行间距必须放在此函数返回的内容内部（padding）——容器 gap 与 margin 对测量不可见，否则几何会每行漂移一个间距。',
      required: true,
    },
    {
      name: 'estimatedItemSize',
      type: 'number | ((item: T, index: number) => number)',
      description:
        '尚未测量行的假定高度；传函数则以函数为准，永不被运行时均值覆盖。要往小估——估小了内容在你下方生长、位置依然有效；估大了滚动范围收缩，浏览器会把位置钳进新范围。',
      default: '120',
    },
    {
      name: 'handleRef',
      type: 'Ref<ChatVirtualizerHandle>',
      description:
        '暴露 scrollToDistanceFromBottomPx 与 anchorToKey 的命令式句柄。两者都是声明参考系而非执行一次滚动：行陆续测量进来时列表会持续恢复所声明的位置，因此落点不会被其后到达的内容冲掉。',
    },
    {
      name: 'getItemType',
      type: '(item: T, index: number) => string',
      description:
        '为行分类，使测量尺寸按类型累积运行均值。单行工具短输出与长 markdown 混排的会话因此能为每种形态收敛出诚实的估计值，而不是一个混合数字。',
    },
    {
      name: 'scrollElement',
      type: 'HTMLElement | null',
      description:
        '接管模式：调用方已有的滚动容器，占位与行作为一个内容块渲染进去，列表不再自建滚动器。传元素本身而非 ref：父的 ref 在子的 layout effect 之后才装配，因此最先需要滚动器的那次提交里 ref 仍读到 null；而且 ref 赋值对 React 不可见——落地时既不重渲染也不重跑 effect；元素存进 state 才让它的到达成为一次渲染和真正的依赖（容器变化时滚动监听、观察与手势状态机都会重建）。请在 passive effect 里读出并存进 state。尚未就绪时传 null 而不是 undefined：undefined 表示自建容器模式，在不限高的父容器里哪怕只有一次这样的提交也会挂载全部行。',
    },
    {
      name: 'endThreshold',
      type: 'number',
      description:
        '用户滚动落点距底部多少 px 以内才重新接管对最新消息的跟随；脱离则是任何越过它的向上移动。设得太紧，视觉上停在底部的用户（触控板惯性、非整数行高、页面缩放）会在输出持续增长时悄悄停止跟随。',
      default: '24',
    },
    {
      name: 'overscanTop',
      type: 'number',
      description:
        '视口上方额外保持挂载的行高（px），在需要计算新窗口前吸收向上滚动。',
      default: '1600',
    },
    {
      name: 'overscanBottom',
      type: 'number',
      description: '视口下方额外保持挂载的行高（px）。',
      default: '600',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '列表自建滚动容器的无障碍名称，键盘用户可聚焦并滚动它。仅自建容器模式有效；接管模式下由调用方为自己的滚动器命名。',
      default: "'Messages' (translated)",
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description: '应用在列表自建的滚动容器上。仅自建容器模式有效。',
    },
    {
      name: 'className',
      type: 'string',
      description: '应用在列表自建的滚动容器上。仅自建容器模式有效。',
    },
  ],
};

export const docsZh = {
  name: 'ChatVirtualizer',
  displayName: 'Chat Virtualizer',
  description:
    '面向长会话的窗口化消息列表：只渲染视口附近的行，其余用两个占位元素表示，因此上千条消息的线程只消耗一个视口的 DOM。行保持在正常文档流中。手指滚动列表期间，位置修正写入占位高度而非跳写 scrollTop，所以手指下的内容不会移动；该次滚动结束后修正落定。触摸手势之外，列表直接写入 scrollTop。默认跟随最新消息，用户滚动落在距底部 endThreshold 以内时重新接管跟随。可自建滚动容器，也可嵌入调用方已有的容器（见 scrollElement）。',
  propDescriptions: {
    data: '要渲染的行，按时间正序。变更通过引用比较检测，所以请替换数组而不要原地修改。',
    getRowKey:
      '每行的稳定标识（内部用 String() 转换）。尺寸缓存与运行时均值都以它为键，用下标派生会在列表位移时丢弃全部测量结果。',
    renderItem:
      '渲染单行。行间距必须放在返回内容内部（padding）——容器的 gap 和 margin 测量不到，会让几何每行漂移一个间距。',
    estimatedItemSize:
      '未测量行的假定高度；传函数则以函数为准，不受运行时均值覆盖。要往小估：估小了内容向下生长、位置依然有效；估大了滚动范围收缩，浏览器会把位置钳进新范围，无法挽回。',
    handleRef:
      '暴露 scrollToDistanceFromBottomPx 与 anchorToKey 的命令式句柄。两者都是“声明参考系”而非执行一次滚动：行陆续测量进来时列表会持续恢复所声明的位置。',
    getItemType:
      '为行分类，使测量结果按类型累积均值。工具调用短行与长 markdown 混排的会话因此能收敛出各自诚实的价格，而非一个混合数字。',
    scrollElement:
      '接管模式：调用方已有的滚动容器，占位与行包在一个内容块里渲染进去，列表不再自建滚动容器。传元素本身而非 ref：父的 ref 在子的 layout effect 之后才装配，所以最先需要滚动容器的那次提交里 ref 仍读到 null；而且 ref 赋值对 React 不可见，落地时既不重渲染也不重跑 effect，元素存进 state 才让“到达”成为一次渲染和真正的依赖（换容器时滚动监听、观察和手势状态机都要重建）。请在 passive effect 里读出并存进 state。尚未就绪时传 null 而不是 undefined：undefined 表示自建容器模式，在不限高的父容器里哪怕只有一次提交也会挂载全部行。',
    endThreshold:
      '用户滚动落点距底部多少 px 才重新接管跟随；脱离则是任何越过该范围的向上移动。设得太紧，视觉上停在底部的用户（触控板惯性、小数行高、页面缩放）会在内容持续产出时悄悄停止跟随。',
    overscanTop:
      '视口上方额外保持挂载的行数（按 px），用于在需要重算窗口前吸收向上滚动。',
    overscanBottom: '视口下方额外保持挂载的行数（按 px）。',
    label:
      '列表自建滚动容器的无障碍名称，键盘用户可聚焦并滚动它。仅自建容器模式有效；接管模式下由调用方为自己的滚动容器命名。',
    style: '应用在列表自建的滚动容器上。仅自建容器模式有效。',
    className: '应用在列表自建的滚动容器上。仅自建容器模式有效。',
  },
};

export const docsDense = {
  name: 'ChatVirtualizer',
  displayName: 'Chat Virtualizer',
  description:
    '窗口化消息列表；视口附近行 + 2 个占位 => 上千条消息只需一个视口的 DOM；行在文档流中；手指滚动期间修正写入占位高度而非 scrollTop（手指下内容不动，滚动结束落定），否则写 scrollTop；默认跟随最新消息，落点距底部 endThreshold 以内重新接管；自建滚动器或接管调用方容器（scrollElement）',
  propDescriptions: {
    data: '行按最旧在前；引用比较检测变更——替换而非原地修改',
    getRowKey:
      '每行稳定标识；尺寸缓存与运行均值的键——绝不要用下标派生',
    renderItem:
      '渲染单行；间距必须用行内 padding，不能用容器 gap/margin',
    estimatedItemSize:
      '未测量行的高度（函数为准）；往小估——过大收缩范围，浏览器会把位置钳进新范围',
    handleRef:
      'scrollToDistanceFromBottomPx + anchorToKey；两者都声明参考系，随行测量恢复位置',
    getItemType:
      '按类型累积运行均值；避免工具短输出与长 markdown 混为一谈',
    scrollElement:
      '接管模式：调用方滚动器，行渲染为单一内容块；传元素而非 ref（父 ref 在子 layout effect 之后才装配 + ref 赋值对 React 不可见）——在 passive effect 读取并存进 state；未就绪时传 null（非 undefined），否则一次提交就挂载全部行',
    endThreshold:
      '用户滚动重新接管跟随所需的距底部 px；过紧 = 悄悄停止跟随',
    overscanTop: '视口上方挂载的行高 px',
    overscanBottom: '视口下方挂载的行高 px',
    label:
      "自建滚动器名称（可键盘聚焦的组）；默认 'Messages'；仅自建容器模式",
    style: '作用于自建滚动器；仅自建容器模式',
    className: '作用于自建滚动器；仅自建容器模式',
  },
};
