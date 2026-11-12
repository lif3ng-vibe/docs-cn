// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Per-theme content for the /themes showcase (the theme-showcase template
 * rendered by ThemePackagePage).
 *
 * The template ships with a generic "Studio" store (minimalist watch, wireless
 * headphones, etc.) as its defaults. Some themes read better with bespoke
 * products that match their personality — e.g. Matcha shows a matcha café menu
 * instead of gadgets. This registry supplies those overrides; the template
 * falls back to its own neutral defaults for any theme not listed here.
 *
 * Keyed by theme slug (the `<slug>` in `@astryxdesign/theme-<slug>` / /themes?theme=<slug>).
 */

import type {
  ProductSpec,
  InventoryRow,
} from '../../../../packages/cli/assets/templates/pages/theme-showcase/page';

// Hand-written asset URLs are root-absolute and bypass Next's basePath
// auto-prefixing; wrap them so subpath-mounted builds (the GitHub Pages
// mirror) resolve. __NEXT_ROUTER_BASEPATH inlines at build time.
const B = process.env.__NEXT_ROUTER_BASEPATH ?? '';
const img = (p: string) => `${B}${p}`;

export interface ThemeShowcaseContent {
  images: Record<string, string>;
  products: ProductSpec[];
  inventory: InventoryRow[];
}


// Matcha café — matcha-drink photos.
const MATCHA_IMAGES: Record<string, string> = {
  watch: img('/images/matcha/preview-watch.png'),
  headphones: img('/images/matcha/preview-headphones.png'),
  backpack: img('/images/matcha/preview-backpack.png'),
  wallet: img('/images/matcha/preview-wallet.png'),
  tumbler: img('/images/matcha/preview-tumbler.png'),
  throw_: img('/images/matcha/preview-throw.png'),
};

const MATCHA_CONTENT: ThemeShowcaseContent = {
  images: MATCHA_IMAGES,
  products: [
    {
      name: '抹茶',
      description: '石磨抹茶注入冷牛奶。',
      badge: '经典',
      badgeVariant: 'green',
    },
    {
      name: '草莓抹茶',
      description: '新鲜草莓果泥，叠上清爽抹茶。',
      badge: '季节限定',
      badgeVariant: 'orange',
    },
    {
      name: '香芋抹茶',
      description: '绵密香芋与抹茶，甜润与草木香交织。',
      badge: '新品',
      badgeVariant: 'blue',
    },
  ],
  inventory: [
    {
      id: 'a',
      name: '抹茶',
      meta: '仪式级，燕麦奶或全脂奶',
      available: 64,
      location: '吧台 1',
      tags: [{label: '经典', variant: 'green'}],
      imageKey: 'watch',
      thumbnailFallback: 'M',
      selected: false,
    },
    {
      id: 'b',
      name: '草莓抹茶',
      meta: '真实果泥，不加糖浆',
      available: 38,
      location: '吧台 2',
      tags: [{label: '季节限定', variant: 'orange'}],
      imageKey: 'headphones',
      thumbnailFallback: 'S',
      selected: true,
    },
    {
      id: 'c',
      name: '香芋抹茶',
      meta: '香芋奶油，双份浓缩',
      available: 51,
      location: '吧台 2',
      tags: [{label: '新品', variant: 'blue'}],
      imageKey: 'backpack',
      thumbnailFallback: 'U',
      selected: false,
    },
    {
      id: 'd',
      name: '香草抹茶',
      meta: '马达加斯加香草荚',
      available: 12,
      location: '吧台 3',
      tags: [{label: '醇滑', variant: 'yellow'}],
      imageKey: 'wallet',
      thumbnailFallback: 'V',
      selected: true,
    },
    {
      id: 'e',
      name: '榛果抹茶',
      meta: '烤榛果，奶油顶',
      available: 27,
      location: '吧台 3',
      tags: [{label: '浓郁', variant: 'green'}],
      imageKey: 'tumbler',
      thumbnailFallback: 'H',
      selected: false,
    },
    {
      id: 'f',
      name: '抹茶摩卡',
      meta: '黑巧克力，单一产地',
      available: 19,
      location: '吧台 4',
      tags: [{label: '浓烈', variant: 'orange'}],
      imageKey: 'throw_',
      thumbnailFallback: 'M',
      selected: true,
    },
  ],
};

// Butter bakery — butter/breakfast photos. Only five Butter assets exist, so
// the croissant is reused for the sixth slot.
const BUTTER_IMAGES: Record<string, string> = {
  watch: img('/images/butter/preview-watch.png'),
  headphones: img('/images/butter/preview-headphones.png'),
  backpack: img('/images/butter/preview-backpack.png'),
  wallet: img('/images/butter/preview-wallet.png'),
  tumbler: img('/images/butter/preview-tumbler.png'),
  throw_: img('/images/butter/preview-throw.png'),
};

const BUTTER_CONTENT: ThemeShowcaseContent = {
  images: BUTTER_IMAGES,
  products: [
    {
      name: '黄油可颂',
      description: '层层起酥，每天清晨烤至金黄。',
      badge: '新鲜出炉',
      badgeVariant: 'yellow',
    },
    {
      name: '松饼',
      description: '层层叠起，配一块慢慢融化的黄油。',
      badge: '人气',
      badgeVariant: 'orange',
    },
    {
      name: '比利时华夫饼',
      description: '深深的格子专为糖浆与黄油而设。',
      badge: '新品',
      badgeVariant: 'green',
    },
  ],
  inventory: [
    {
      id: 'a',
      name: '黄油可颂',
      meta: '全黄油，27 层起酥',
      available: 64,
      location: '展示柜 1',
      tags: [{label: '新鲜出炉', variant: 'yellow'}],
      imageKey: 'watch',
      thumbnailFallback: 'C',
      selected: false,
    },
    {
      id: 'b',
      name: '松饼',
      meta: '三块叠放',
      available: 38,
      location: '煎盘',
      tags: [{label: '人气', variant: 'orange'}],
      imageKey: 'headphones',
      thumbnailFallback: 'P',
      selected: true,
    },
    {
      id: 'c',
      name: '比利时华夫饼',
      meta: '列日风味，珍珠糖',
      available: 51,
      location: '煎盘',
      tags: [{label: '新品', variant: 'green'}],
      imageKey: 'backpack',
      thumbnailFallback: 'W',
      selected: false,
    },
    {
      id: 'd',
      name: '黄油吐司',
      meta: '酸面包，厚切',
      available: 12,
      location: '展示柜 2',
      tags: [{label: '经典', variant: 'yellow'}],
      imageKey: 'wallet',
      thumbnailFallback: 'T',
      selected: true,
    },
    {
      id: 'e',
      name: '发酵黄油',
      meta: '欧式，加盐',
      available: 27,
      location: '冷藏柜',
      tags: [{label: '常备', variant: 'orange'}],
      imageKey: 'tumbler',
      thumbnailFallback: 'B',
      selected: false,
    },
    {
      id: 'f',
      name: '杏仁可颂',
      meta: '杏仁奶油馅',
      available: 19,
      location: '展示柜 1',
      tags: [{label: '限量', variant: 'green'}],
      imageKey: 'throw_',
      thumbnailFallback: 'A',
      selected: true,
    },
  ],
};

// Stone homeware — stoneware photos on stone plinths.
const STONE_IMAGES: Record<string, string> = {
  watch: img('/images/stone/preview-watch.png'),
  headphones: img('/images/stone/preview-headphones.png'),
  backpack: img('/images/stone/preview-backpack.png'),
  wallet: img('/images/stone/preview-wallet.png'),
  tumbler: img('/images/stone/preview-tumbler.png'),
  throw_: img('/images/stone/preview-throw.png'),
};

const STONE_CONTENT: ThemeShowcaseContent = {
  images: STONE_IMAGES,
  products: [
    {
      name: '斑点碗',
      description: '手工拉坯炻器，保留原泥底足。',
      badge: '新品',
      badgeVariant: 'blue',
    },
    {
      name: '陶瓷杯',
      description: '日常杯碟，触感温润。',
      badge: '人气',
      badgeVariant: 'green',
    },
    {
      name: '炻器餐盘',
      description: '反应哑光釉，柔和橄榄色调。',
      badge: '限量',
      badgeVariant: 'yellow',
    },
  ],
  inventory: [
    {
      id: 'a',
      name: '斑点碗',
      meta: '炻器，16cm',
      available: 64,
      location: '货架 1',
      tags: [{label: '新品', variant: 'blue'}],
      imageKey: 'watch',
      thumbnailFallback: 'B',
      selected: false,
    },
    {
      id: 'b',
      name: '陶瓷杯',
      meta: '杯 + 碟，8oz',
      available: 38,
      location: '货架 2',
      tags: [{label: '人气', variant: 'green'}],
      imageKey: 'headphones',
      thumbnailFallback: 'C',
      selected: true,
    },
    {
      id: 'c',
      name: '炻器餐盘',
      meta: '反应釉，22cm',
      available: 51,
      location: '货架 1',
      tags: [{label: '限量', variant: 'yellow'}],
      imageKey: 'backpack',
      thumbnailFallback: 'P',
      selected: false,
    },
    {
      id: 'd',
      name: '餐碗',
      meta: '双色，24cm',
      available: 15,
      location: '货架 3',
      tags: [{label: '餐具', variant: 'orange'}],
      imageKey: 'wallet',
      thumbnailFallback: 'S',
      selected: true,
    },
    {
      id: 'e',
      name: '炻器茶壶',
      meta: '哑光陶泥，700ml',
      available: 27,
      location: '货架 2',
      tags: [{label: '厨房', variant: 'green'}],
      imageKey: 'tumbler',
      thumbnailFallback: 'T',
      selected: false,
    },
    {
      id: 'f',
      name: '小花瓶',
      meta: '橄榄釉，18cm',
      available: 19,
      location: '货架 1',
      tags: [{label: '小批量', variant: 'orange'}],
      imageKey: 'throw_',
      thumbnailFallback: 'V',
      selected: true,
    },
  ],
};

// Y2K trinkets — iridescent/holo objects.
const Y2K_IMAGES: Record<string, string> = {
  watch: img('/images/y2k/preview-watch.png'),
  headphones: img('/images/y2k/preview-headphones.png'),
  backpack: img('/images/y2k/preview-backpack.png'),
  wallet: img('/images/y2k/preview-wallet.png'),
  tumbler: img('/images/y2k/preview-tumbler.png'),
  throw_: img('/images/y2k/preview-throw.png'),
};

const Y2K_CONTENT: ThemeShowcaseContent = {
  images: Y2K_IMAGES,
  products: [
    {
      name: '手机',
      description: '幻彩贝壳机，配彩虹屏。',
      badge: '复古',
      badgeVariant: 'blue',
    },
    {
      name: '发光星星套装',
      description: '夜光星星，三枚装。',
      badge: '人气',
      badgeVariant: 'green',
    },
    {
      name: '蝴蝶',
      description: '粉彩铬色闪亮贴饰。',
      badge: '新品',
      badgeVariant: 'purple',
    },
  ],
  inventory: [
    {
      id: 'a',
      name: '手机',
      meta: '幻彩外壳，彩虹 LCD',
      available: 64,
      location: '货箱 1',
      tags: [{label: '复古', variant: 'blue'}],
      imageKey: 'watch',
      thumbnailFallback: 'P',
      selected: false,
    },
    {
      id: 'b',
      name: '发光星星套装',
      meta: '夜光材质，三枚装',
      available: 38,
      location: '货箱 2',
      tags: [{label: '人气', variant: 'green'}],
      imageKey: 'headphones',
      thumbnailFallback: 'S',
      selected: true,
    },
    {
      id: 'c',
      name: '蝴蝶',
      meta: '贴饰，粉彩铬色',
      available: 51,
      location: '货箱 2',
      tags: [{label: '新品', variant: 'purple'}],
      imageKey: 'backpack',
      thumbnailFallback: 'B',
      selected: false,
    },
    {
      id: 'd',
      name: '泡芙爱心挂件',
      meta: '软胶材质，全息光泽',
      available: 12,
      location: '货箱 3',
      tags: [{label: '经典', variant: 'pink'}],
      imageKey: 'wallet',
      thumbnailFallback: 'H',
      selected: true,
    },
    {
      id: 'e',
      name: '雏菊挂件',
      meta: '全息膜，可夹式',
      available: 27,
      location: '货箱 3',
      tags: [{label: '可爱', variant: 'pink'}],
      imageKey: 'tumbler',
      thumbnailFallback: 'D',
      selected: false,
    },
    {
      id: 'f',
      name: '充气沙发',
      meta: '透明粉，双人座',
      available: 19,
      location: '货箱 1',
      tags: [{label: '限量', variant: 'pink'}],
      imageKey: 'throw_',
      thumbnailFallback: 'C',
      selected: true,
    },
  ],
};

// Gothic botanicals — moody single-stem floral photos.
const GOTHIC_IMAGES: Record<string, string> = {
  watch: img('/images/gothic/preview-watch.png'),
  headphones: img('/images/gothic/preview-headphones.png'),
  backpack: img('/images/gothic/preview-backpack.png'),
  wallet: img('/images/gothic/preview-wallet.png'),
  tumbler: img('/images/gothic/preview-tumbler.png'),
  throw_: img('/images/gothic/preview-throw.png'),
};

const GOTHIC_CONTENT: ThemeShowcaseContent = {
  images: GOTHIC_IMAGES,
  products: [
    {
      name: '刺芹',
      description: '一支干制刺芹，花头泛着冷冽金属光泽。',
      badge: '新品',
      badgeVariant: 'blue',
    },
    {
      name: '庭园玫瑰',
      description: '一支蜜桃花头，每天清晨新剪。',
      badge: '人气',
      badgeVariant: 'red',
    },
    {
      name: '花毛茛',
      description: '柔紫花瓣层层叠叠。',
      badge: '限量',
      badgeVariant: 'purple',
    },
  ],
  inventory: [
    {
      id: 'a',
      name: '刺芹',
      meta: '干制，单支',
      available: 64,
      location: '冷藏柜 1',
      tags: [{label: '新品', variant: 'blue'}],
      imageKey: 'watch',
      thumbnailFallback: 'S',
      selected: false,
    },
    {
      id: 'b',
      name: '庭园玫瑰',
      meta: '鲜切，蜜桃色',
      available: 38,
      location: '冷藏柜 2',
      tags: [{label: '人气', variant: 'red'}],
      imageKey: 'headphones',
      thumbnailFallback: 'R',
      selected: true,
    },
    {
      id: 'c',
      name: '花毛茛',
      meta: '鲜切，藕紫色',
      available: 51,
      location: '冷藏柜 2',
      tags: [{label: '限量', variant: 'purple'}],
      imageKey: 'backpack',
      thumbnailFallback: 'R',
      selected: false,
    },
    {
      id: 'd',
      name: '珊瑚虞美人',
      meta: '鲜切，单支',
      available: 15,
      location: '冷藏柜 3',
      tags: [{label: '季节限定', variant: 'orange'}],
      imageKey: 'wallet',
      thumbnailFallback: 'P',
      selected: true,
    },
    {
      id: 'e',
      name: '粉郁金香',
      meta: '鲜切，单支',
      available: 27,
      location: '冷藏柜 2',
      tags: [{label: '春日', variant: 'pink'}],
      imageKey: 'tumbler',
      thumbnailFallback: 'T',
      selected: false,
    },
    {
      id: 'f',
      name: '干黑种草果荚',
      meta: '干制，枝材',
      available: 19,
      location: '冷藏柜 1',
      tags: [{label: '小批量', variant: 'green'}],
      imageKey: 'throw_',
      thumbnailFallback: 'N',
      selected: true,
    },
  ],
};

const CONTENT_BY_THEME: Record<string, ThemeShowcaseContent> = {
  matcha: MATCHA_CONTENT,
  butter: BUTTER_CONTENT,
  stone: STONE_CONTENT,
  y2k: Y2K_CONTENT,
  gothic: GOTHIC_CONTENT,
};

/**
 * Resolve bespoke showcase content for a theme slug, or `undefined` when the
 * theme has no override (the template then renders its neutral defaults).
 */
export function getThemeShowcaseContent(
  slug: string,
): ThemeShowcaseContent | undefined {
  return CONTENT_BY_THEME[slug];
}
