// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useImageMode',
  displayName: 'useImageMode',
  keywords: ['image', 'dark', 'light', '图像', '明暗模式', '亮度', '对比度', 'theme', 'media', 'apca', 'contrast'],
  params: [
    {
      name: 'src',
      type: 'string | null | undefined',
      description: '要分析的图片源 URL。当为 null/undefined 时返回回退值。',
      required: true,
    },
    {
      name: 'options',
      type: 'UseImageModeOptions',
      description: '图片分析的可选配置。',
      required: false,
    },
    {
      name: 'options.region',
      type: 'ImageSampleRegion',
      description: '在图片中采样的区域，使用归一化的 0-1 坐标（{ x, y, width, height }）。默认为整张图片。',
      required: false,
    },
    {
      name: 'options.threshold',
      type: 'number',
      description: '区分深色/浅色的亮度阈值。低于为深色，高于为浅色。',
      default: '0.5',
      required: false,
    },
    {
      name: 'options.fallback',
      type: "'dark' | 'light' | null",
      description: '加载中或出错时的回退值。',
      default: 'null',
      required: false,
    },
  ],
  returns: [
    {
      name: 'mode',
      type: "'dark' | 'light' | null",
      description: "检测到的图片明暗模式。加载中或 src 为 null/undefined 时返回 null。",
    },
  ],
  usage: {
    description:
      '通过 OffscreenCanvas 采样像素，检测图片整体偏深色还是浅色。使用 APCA 感知亮度（sRGB 线性化 + 幂曲线）保证检测准确，尤其在饱和色上。完全脱离绘制路径运行：不产生可见画布，也不引发布局抖动。支持区域采样，用于检测文字叠放位置的亮度。加载中返回 null，遇 CORS 或网络错误时优雅回退。',
    bestPractices: [
      { guidance: true, description: '与 MediaTheme 搭配，在动态背景图上自动适配文字颜色。' },
      { guidance: true, description: '用 region 选项只采样文字将要叠放的区域，以获得更准确的结果。' },
      { guidance: false, description: '不要用于变化迅速的图片（如视频帧）；每次 src 变化都会触发一次新的抓取与分析。' },
    ],
  },
  relatedComponents: ['MediaTheme'],
  relatedHooks: ['useMediaQuery'],
  importPath: '@astryxdesign/core/hooks',
  category: 'media',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '通过 OffscreenCanvas 采样像素，检测图片整体偏深色还是浅色。使用 APCA 感知亮度（sRGB 线性化 + 幂曲线）保证检测准确，尤其在饱和色上。完全脱离绘制路径运行：无可见画布、无布局抖动。支持区域采样，用于检测文字叠放位置的亮度。加载中返回 null，遇 CORS/网络错误时优雅回退。',
  paramDescriptions: {
    src: '要分析的图片源 URL。为 null/undefined 时返回回退值。',
    options: '图片分析的可选配置。',
    'options.region': '在图片中采样的区域，使用归一化 0-1 坐标（{ x, y, width, height }）。默认为整张图片。',
    'options.threshold': '区分深色/浅色的亮度阈值。低于为深色，高于为浅色。',
    'options.fallback': '加载中或出错时的回退值。',
  },
  returnDescriptions: {
    mode: '检测到的图片明暗模式。加载中或 src 为 null/undefined 时返回 null。',
  },
  usage: {
    description:
      '通过 OffscreenCanvas 采样像素，检测图片整体偏深色还是浅色。使用 APCA 感知亮度（sRGB 线性化 + 幂曲线）保证检测准确，尤其在饱和色上。完全脱离绘制路径运行：无可见画布、无布局抖动。支持区域采样，用于检测文字叠放位置的亮度。加载中返回 null，遇 CORS/网络错误时优雅回退。',
    bestPractices: [
      { guidance: true, description: '与 MediaTheme 搭配，在动态背景图上自动适配文字颜色。' },
      { guidance: true, description: '用 region 选项只采样文字将要叠放的区域，结果更准确。' },
      { guidance: false, description: '不要用于变化迅速的图片（如视频帧）；每次 src 变化都会触发新的抓取与分析。' },
    ],
  },
};
