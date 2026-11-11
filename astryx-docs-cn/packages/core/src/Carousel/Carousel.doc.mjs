// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Carousel',
  displayName: 'Carousel',
  category: 'Container',
  keywords: ['carousel', '滑块', '滚动', '画廊', '胶片条', 'swiper', '水平', '溢出', '吸附'],
  usage: {
    description:
      'Carousel 在项目超出可用宽度时将一行项目水平滚动。适用于卡片网格、图片画廊、产品列表，或任何希望无需占据整页即可浏览的项目集合。',
    bestPractices: [
      {guidance: true, description: '当每个项目应精确对齐到起始边缘时启用滚动吸附，例如画廊或产品列表。'},
      {guidance: true, description: "手指与触控板轻扫下的 iOS 分页，传入 @astryxdesign/core/SnapPaging 的 hasSnap={useSnapPaging()}。一次轻扫移动一屏，或用 useSnapPaging({pages: 'item'}) 移动一项。鼠标滚轮保持原生吸附。只有配置了该值的轮播才加载分页代码。"},
      {guidance: true, description: '在小型可循环的集合（如照片画廊）上使用 hasLoop，此时从最后一项绕回第一项的滚动更自然。'},
      {guidance: true, description: '始终提供描述轮播内容的 aria-label，例如 "精选产品" 或 "团队成员"。'},
      {guidance: true, description: 'Carousel 实现 WAI-ARIA APG carousel 模式（https://www.w3.org/WAI/ARIA/apg/patterns/carousel/）且不自动轮播：区域带标签并携带 aria-roledescription="carousel"，每个项目是名为 "第 N 张，共 M 张" 的 group；内容溢出时滚动容器是 Tab 停靠点，键盘用户可用方向键平移；内容全部容纳时则退出 Tab 序列。'},
      {guidance: true, description: '使用一致的间距和项目宽度，让轮播看起来是有意为之，而不是内容意外溢出。'},
      {guidance: true, description: '信任内置导航：触控板用户可水平滑动，鼠标用户可按住 Shift 滚动滚轮来浏览项目。'},
      {guidance: false, description: '将每位用户都必须看到的内容放入轮播。并非所有人都会水平滚动，关键内容应放在首屏。'},
      {guidance: false, description: '自动轮播项目。让用户按自己的节奏滚动。'},
      {guidance: false, description: '嵌套轮播。轮播中嵌套轮播会造成困惑并破坏键盘导航。'},
    ],
    anatomy: [
      {name: 'Scroll container', required: true, description: '承载所有项目的水平溢出区域。'},
      {name: 'Items', required: true, description: '在滚动容器内按行渲染的 children。启用 hasSnap 时，每个项目吸附到起始边缘。'},
      {name: 'Fade edges', required: false, description: '左右边缘的渐变淡出，提示还有更多内容。默认启用，用 hasEdgeFade={false} 关闭。'},
      {name: 'Navigation buttons', required: false, description: '内容可向该方向滚动时出现的上一个/下一个按钮。默认启用，用 hasButtons={false} 关闭。'},
    ],
  },
  props: [
    {name: 'children', type: 'ReactNode', description: '在水平滚动容器中渲染的轮播项目。', required: true},
    {name: 'gap', type: "0 | 0.5 | 1 | 1.5 | 2 | 3 | 4", description: '使用间距令牌比例的项目间距。', default: '1'},
    {name: 'hasButtons', type: 'boolean', description: '内容可滚动时显示上一个/下一个导航按钮。', default: 'true'},
    {name: 'hasEdgeFade', type: 'boolean', description: '内容溢出时显示渐变边缘遮罩，提示屏幕外还有更多项目。', default: 'true'},
    {name: 'hasLoop', type: 'boolean', description: '环绕滚动：在末尾按"下一个"回到开头，在开头按"上一个"跳到末尾。按钮在两端始终可见。仅在内容溢出时生效。', default: 'false'},
    {name: 'hasSnap', type: 'boolean | SnapPaging', description: "使每个子元素吸附到起始边缘。hasSnap 使用原生 CSS 滚动吸附。hasSnap={useSnapPaging()} 在相同吸附点上增加手指和触控板轻扫下的 iOS 分页：一次轻扫移动一屏，或用 useSnapPaging({pages: 'item'}) 移动一项。只有该值会加载分页代码。", default: 'false'},
    {name: 'padding', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: '滚动容器内的内联内边距，并设置匹配的 scroll-padding，使吸附点与内容边缘对齐。'},
    {name: 'aria-label', type: 'string', description: '轮播区域的无障碍标签。', default: "\'Carousel\'"},
    {name: 'ref', type: 'React.Ref<HTMLDivElement>', description: '转发到根元素的 ref。'},
    {name: 'handleRef', type: 'React.Ref<CarouselHandle>', description: '命令式句柄，暴露 scrollNext()、scrollPrev()、scrollTo(index)、canScrollNext() 和 canScrollPrev() 以进行编程式滚动控制。'},
    {name: 'xstyle', type: 'StyleXStyles', description: '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值。'},
    {name: 'className', type: 'string', description: '根元素的 CSS 类名。样式优先用 xstyle。'},
    {name: 'style', type: 'CSSProperties', description: '根元素的内联样式。优先用 xstyle。'},
    {name: 'data-testid', type: 'string', description: '供自动化测试框架使用的测试选择器。'},
  ],
  playground: {
    defaults: {
      children: [
        {__element: 'Card', props: {padding: 4}, children: '第 1 张'},
        {__element: 'Card', props: {padding: 4}, children: '第 2 张'},
        {__element: 'Card', props: {padding: 4}, children: '第 3 张'},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-carousel'},
      {className: 'astryx-carousel-scroller', visualProps: ['gap', 'padding', 'snap', 'edgeFade']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Carousel 在项目超出可用宽度时将一行项目水平滚动。适用于卡片网格、图片画廊、产品列表，或任何希望无需占据整页即可浏览的项目集合。',
    bestPractices: [
      {guidance: true, description: '当每个项目应精确对齐到起始边缘时启用滚动吸附，例如画廊或产品列表。'},
      {guidance: true, description: '在小型可循环的集合（如照片画廊）上使用 hasLoop，此时从最后一项绕回第一项的滚动更自然。'},
      {guidance: true, description: '始终提供描述轮播内容的 aria-label，例如"精选产品"或"团队成员"。'},
      {guidance: true, description: 'Carousel 实现不含自动轮播的 WAI-ARIA APG carousel 模式（https://www.w3.org/WAI/ARIA/apg/patterns/carousel/）：区域带有标签和 aria-roledescription="carousel"，每个项目是名为“第 N 张，共 M 张”的 group，滚动容器可获得焦点，键盘用户可用方向键平移。'},
      {guidance: true, description: '使用一致的间距和项目宽度，让轮播看起来是有意为之，而不是内容意外溢出。'},
      {guidance: true, description: '信任内置导航：触控板用户可水平滑动，鼠标用户可按住 Shift 滚动滚轮来浏览项目。'},
      {guidance: false, description: '将每位用户都必须看到的内容放入轮播。并非所有人都会水平滚动，关键内容应放在首屏。'},
      {guidance: false, description: '自动轮播项目。让用户按自己的节奏滚动。'},
      {guidance: false, description: '嵌套轮播。轮播中嵌套轮播会造成困惑并破坏键盘导航。'},
    ],
  },
  propDescriptions: {
    children: '在水平滚动容器中渲染的轮播项目。',
    gap: '使用间距令牌比例的项目间距。',
    hasButtons: '内容可滚动时显示上一个/下一个导航按钮。',
    hasEdgeFade: '内容溢出时显示渐变边缘遮罩，提示屏幕外还有更多项目。',
    hasLoop: '环绕滚动：在末尾按"下一个"回到开头，在开头按"上一个"跳到末尾。按钮在两端始终可见。仅在内容溢出时生效。',
    hasSnap: "使每个子元素吸附到起始边缘。hasSnap 使用原生 CSS 滚动吸附。hasSnap={useSnapPaging()} 在相同吸附点上增加手指和触控板轻扫下的 iOS 分页：一次轻扫移动一屏，或用 useSnapPaging({pages: 'item'}) 移动一项。只有该值会加载分页代码。",
    padding: '滚动容器内的内联内边距，并设置匹配的 scroll-padding，使吸附点与内容边缘对齐。',
    'aria-label': '轮播区域的无障碍标签。',
    handleRef: '命令式句柄，暴露 scrollNext()、scrollPrev()、scrollTo(index)、canScrollNext() 和 canScrollPrev() 以进行编程式滚动控制。',
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '水平滚动容器：渐变边缘、导航按钮、滚动吸附',
  usage: {
    description:
      '项目溢出时 Carousel 水平滚动。用于卡片网格、画廊、产品列表。',
    bestPractices: [
      {guidance: true, description: '项目需精确停在起始边缘时启用滚动吸附：画廊、产品列表。'},
      {guidance: true, description: '小型可循环集合（照片画廊）从末项绕回首项更自然时用 hasLoop。'},
      {guidance: true, description: '始终提供描述轮播内容的 aria-label："精选产品"、"团队成员"。'},
      {guidance: true, description: '间距 + 项目宽度保持一致，让轮播看起来是有意设计，而非内容意外溢出。'},
      {guidance: true, description: '信任内置导航：触控板水平轻扫，鼠标按住 Shift + 滚轮浏览项目。'},
      {guidance: false, description: '将每位用户都必须看到的内容放入轮播。并非所有人都会水平滚动，关键内容应放在首屏。'},
      {guidance: false, description: '自动轮播项目。让用户按自己的节奏滚动。'},
      {guidance: false, description: '嵌套轮播。轮播中嵌套轮播会造成困惑并破坏键盘导航。'},
    ],
  },
  propDescriptions: {
    children: '水平滚动中的轮播项目',
    gap: '经间距令牌比例的项目间距',
    hasButtons: '内容可滚动时显示上一个/下一个按钮',
    hasEdgeFade: '溢出时的渐变边缘遮罩',
    hasLoop: '环绕：末尾 next → 开头，开头 prev → 末尾；按钮始终可见；仅溢出时生效',
    hasSnap: "滚动吸附；子元素吸附到起始边缘。hasSnap={useSnapPaging()}：手指或触控板轻扫下的 iOS 分页，一次轻扫一屏（{pages: 'item'}：一项）；只有该值加载分页器",
    padding: '内联内边距；scroll-padding 使吸附点对齐内容边缘',
    'aria-label': '轮播区域的无障碍标签',
    handleRef: '命令式句柄：scrollNext/scrollPrev/scrollTo(index)/canScrollNext/canScrollPrev',
    'data-testid': '自动化测试框架的测试选择器',
  },
};
