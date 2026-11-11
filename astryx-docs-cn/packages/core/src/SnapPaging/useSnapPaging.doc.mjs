// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useSnapPaging',
  displayName: 'useSnapPaging',
  group: 'Carousel',
  keywords: ['carousel', 'paging', 'snap', 'swipe', '轮播', '分页', '吸附', '轻扫', '滑动翻页', '引导页'],
  params: [
    {
      name: 'options',
      type: "{pages?: 'view' | 'item'}",
      description:
        "一次轻扫移动什么。'view' 移动一个视图，并落在距当前一个视口之内、最近的条目起始边上；'item' 移动一个条目。新值从下一次轻扫起生效。",
      default: "{pages: 'view'}",
    },
  ],
  returns: [
    {
      name: 'paging',
      type: 'SnapPaging',
      description:
        '供 Carousel 的 hasSnap 使用的吸附分页值。该值在组件生命周期内不变，Carousel 会保留首次挂载的值。',
    },
  ],
  usage: {
    description:
      '为 Carousel 提供落在原生吸附停靠点上的 iOS 式分页：把值作为 hasSnap={useSnapPaging()} 传入。手指与触控板轻扫下，一次轻扫移动一个视图（传 {pages: \'item\'} 则移动一个条目），且该行停在某个条目的起始边上。鼠标滚轮保持原生吸附。只有拿到该值的轮播才会加载分页代码。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于一次读一个视图的行，例如引导页或照片条：快速轻扫不应跳过下一个视图。',
      },
      {
        guidance: true,
        description:
          '同时显示多个条目、且每次轻扫只想移动其中一个时，传 {pages: \'item\'}。',
      },
      {
        guidance: false,
        description:
          '不要用于快速浏览的行；普通 hasSnap 保留原生惯性，一次滑动可以越过多个条目。',
      },
    ],
  },
  relatedComponents: ['Carousel'],
  relatedHooks: [],
  importPath: '@astryxdesign/core/SnapPaging',
  category: 'motion & gestures',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '落在原生吸附停靠点上的 Carousel iOS 式分页：hasSnap={useSnapPaging()}。手指或触控板轻扫：每次轻扫一个视图（{pages: \'item\'}：一个条目）；鼠标滚轮保持原生吸附。只有该轮播加载分页器。',
  paramDescriptions: {
    options:
      "{pages: 'view' | 'item'}：一次轻扫移动什么。默认 'view'。新值从下一次轻扫起生效。",
  },
  returnDescriptions: {
    paging:
      '供 Carousel 的 hasSnap 使用的值；组件生命周期内不变；Carousel 保留首次挂载的值。',
  },
  usage: {
    description:
      "hasSnap={useSnapPaging()}：手指或触控板轻扫下每次轻扫一个视图，停在条目起始边上。{pages: 'item'}：一个条目。鼠标滚轮保持原生。",
    bestPractices: [
      {
        guidance: true,
        description: '用于一次读一个视图的行（引导页、照片条）。',
      },
      {
        guidance: true,
        description: "同时显示多个条目且每次轻扫只移动一个时，用 {pages: 'item'}。",
      },
      {
        guidance: false,
        description: '不要用于快速浏览的行；普通 hasSnap 保留原生惯性。',
      },
    ],
  },
};
