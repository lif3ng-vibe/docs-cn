/**
 * Manual metadata for the /anti-patterns page.
 *
 * The detection rules themselves live in cli/engine/registry/antipatterns.mjs.
 * This file adds three pieces of content that
 * can't be automated:
 *
 *  1. DETECTION_LAYERS: which layer (cli, browser, or llm) catches the
 *     rule. Manually classified by reading the detector source and the
 *     browser-only test file.
 *
 *  2. VISUAL_EXAMPLES: a tiny inline HTML snippet showing what the
 *     bad pattern actually looks like. Rendered inside each rule card.
 *     Snippets should be self-contained with inline styles, use the
 *     cream/paper/ink palette when possible, and sit naturally at
 *     ~100% width by ~120px height.
 *
 *  3. LLM_ONLY_RULES: DON'T lines from skill/SKILL.src.md
 *     that do not map to any detection rule. These can only be caught by
 *     the /critique skill's LLM pass. They appear on the /anti-patterns
 *     page alongside detected rules with an 'llm' layer badge.
 */

// ─── Detection layers ────────────────────────────────────────────────

/**
 * Which layer catches each rule.
 *
 *  'cli':     static analysis or jsdom (works with `npx impeccable detect`
 *             on files, no browser required)
 *  'browser': requires real browser layout (getBoundingClientRect with
 *             actual dimensions). Works via Puppeteer or the browser
 *             extension, NOT via the CLI on raw HTML.
 *  'llm':     no deterministic detector; only caught by /critique's LLM
 *             assessment pass.
 *
 * Per tests/detect-antipatterns-browser.test.mjs: only two rules genuinely
 * need real browser layout. Everything else is 'cli'.
 */
export const DETECTION_LAYERS = {
  'side-tab': 'cli',
  'border-accent-on-rounded': 'cli',
  'overused-font': 'cli',
  'single-font': 'cli',
  'flat-type-hierarchy': 'cli',
  'icon-tile-stack': 'cli',
  'gradient-text': 'cli',
  'ai-color-palette': 'cli',
  'dark-glow': 'cli',
  'nested-cards': 'cli',
  'monotonous-spacing': 'cli',
  'everything-centered': 'cli',
  'bounce-easing': 'cli',
  'all-caps-body': 'cli',
  'pure-black-white': 'cli',
  'gray-on-color': 'cli',
  'low-contrast': 'cli',
  'layout-transition': 'cli',
  'tight-leading': 'cli',
  'skipped-heading': 'cli',
  'justified-text': 'cli',
  'tiny-text': 'cli',
  'wide-tracking': 'cli',
  // Browser-only: need real layout measurements.
  'cramped-padding': 'browser',
  'line-length': 'browser',
};

export const LAYER_LABELS = {
  cli: 'CLI',
  browser: '浏览器',
  llm: '仅 LLM',
};

export const LAYER_DESCRIPTIONS = {
  cli: '确定性的。对文件运行 `npx impeccable detect` 即可，无需浏览器。',
  browser: '确定性的，但需要真实浏览器布局。通过浏览器扩展或 Puppeteer 运行，普通 CLI 做不到。',
  llm: '任何确定性检测器都抓不到。由 /impeccable critique 在 LLM 设计评审中标记。',
};

// ─── Visual examples ─────────────────────────────────────────────────

/**
 * One tiny inline HTML snippet per rule showing what the bad pattern
 * looks like. Snippets use inline styles only and are sized to fit the
 * rule card preview area (~100% wide, ~120px tall).
 */
export const VISUAL_EXAMPLES = {
  'side-tab': `<div style="background: #fff; border: 1px solid #e8e4df; border-left: 4px solid oklch(60% 0.22 265); border-radius: 6px; padding: 14px 16px; width: 220px; font-family: system-ui, sans-serif; font-size: 13px; color: #111;"><div style="font-weight: 600; margin-bottom: 4px;">警告标题</div><div style="color: #666; font-size: 12px;">一侧的粗彩色竖条。</div></div>`,

  'border-accent-on-rounded': `<div style="background: #fff; border: 2px solid oklch(60% 0.22 290); border-radius: 16px; padding: 14px 18px; width: 220px; font-family: system-ui, sans-serif; font-size: 13px; color: #111;"><div style="font-weight: 600;">圆角卡片</div><div style="color: #666; font-size: 12px;">粗彩边与圆角互相冲突。</div></div>`,

  'overused-font': `<div style="font-family: Inter, system-ui, sans-serif; font-size: 15px; color: #111; line-height: 1.4;"><div style="font-weight: 600; margin-bottom: 4px;">又一个 Inter 标题</div><div style="color: #555; font-size: 13px;">每个 SaaS 首页都长这样。</div></div>`,

  'single-font': `<div style="font-family: system-ui, sans-serif; font-size: 14px; color: #111;"><div style="font-size: 19px; font-weight: 600; margin-bottom: 6px;">正文同款字体的标题</div><div style="color: #555;">正文也是同一款字体。没有对比，很扁平。</div></div>`,

  'flat-type-hierarchy': `<div style="font-family: system-ui, sans-serif; color: #111; line-height: 1.3;"><div style="font-size: 17px; font-weight: 600;">标题</div><div style="font-size: 16px; font-weight: 500; margin: 2px 0;">副标题</div><div style="font-size: 15px; color: #555;">字号几乎一样的正文。</div></div>`,

  'icon-tile-stack': `<div style="font-family: system-ui, sans-serif; color: #111;"><div style="width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, oklch(62% 0.22 265), oklch(70% 0.20 320)); display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; margin-bottom: 10px;">✦</div><div style="font-size: 14px; font-weight: 600; margin-bottom: 2px;">功能名称</div><div style="font-size: 12px; color: #666;">标题上方的圆角图标块。</div></div>`,

  'gradient-text': `<div style="font-family: system-ui, sans-serif;"><div style="font-size: 28px; font-weight: 700; background: linear-gradient(135deg, oklch(65% 0.25 320), oklch(60% 0.25 265)); -webkit-background-clip: text; background-clip: text; color: transparent; line-height: 1.1;">构建未来</div><div style="font-size: 12px; color: #888; margin-top: 4px;">颜色沿标题渐变。</div></div>`,

  'ai-color-palette': `<div style="display: flex; gap: 6px;"><div style="width: 44px; height: 44px; border-radius: 6px; background: oklch(60% 0.22 265);"></div><div style="width: 44px; height: 44px; border-radius: 6px; background: oklch(62% 0.25 300);"></div><div style="width: 44px; height: 44px; border-radius: 6px; background: oklch(64% 0.25 340);"></div><div style="width: 44px; height: 44px; border-radius: 6px; background: oklch(70% 0.20 200);"></div></div>`,

  'dark-glow': `<div style="background: #0a0b14; padding: 18px 20px; border-radius: 10px; font-family: system-ui, sans-serif;"><div style="color: oklch(78% 0.22 280); text-shadow: 0 0 12px oklch(78% 0.22 280 / 0.7); font-size: 16px; font-weight: 600;">暗底霓虹</div><div style="color: oklch(60% 0.12 260); font-size: 12px; margin-top: 4px;">默认赛博朋克的 slop。</div></div>`,

  'nested-cards': `<div style="background: #f5f3ef; border: 1px solid #e0dcd4; border-radius: 10px; padding: 10px;"><div style="background: #fff; border: 1px solid #e8e4df; border-radius: 8px; padding: 10px;"><div style="background: #f5f3ef; border: 1px solid #e8e4df; border-radius: 6px; padding: 8px; font-size: 12px; font-family: system-ui, sans-serif; color: #555;">卡片套卡片套卡片。</div></div></div>`,

  'monotonous-spacing': `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;"><div style="background: #fff; border: 1px solid #e8e4df; border-radius: 6px; height: 48px;"></div><div style="background: #fff; border: 1px solid #e8e4df; border-radius: 6px; height: 48px;"></div><div style="background: #fff; border: 1px solid #e8e4df; border-radius: 6px; height: 48px;"></div><div style="background: #fff; border: 1px solid #e8e4df; border-radius: 6px; height: 48px;"></div><div style="background: #fff; border: 1px solid #e8e4df; border-radius: 6px; height: 48px;"></div><div style="background: #fff; border: 1px solid #e8e4df; border-radius: 6px; height: 48px;"></div></div>`,

  'everything-centered': `<div style="font-family: system-ui, sans-serif; text-align: center; color: #111;"><div style="font-size: 16px; font-weight: 600; margin-bottom: 6px;">居中的标题</div><div style="font-size: 12px; color: #555; margin-bottom: 10px;">默认一切居中。</div><div style="display: inline-block; background: #111; color: #fff; padding: 6px 14px; border-radius: 6px; font-size: 12px;">行动号召</div></div>`,

  'bounce-easing': `<div style="font-family: system-ui, sans-serif; color: #111; display: flex; align-items: center; gap: 10px;"><div style="width: 36px; height: 36px; border-radius: 50%; background: oklch(65% 0.22 265); animation: bouncey 0.9s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;"></div><div style="font-size: 12px; color: #555;">回弹 + 弹性缓动显得过时。</div><style>@keyframes bouncey { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }</style></div>`,

  'all-caps-body': `<div style="font-family: system-ui, sans-serif; color: #111; font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em; line-height: 1.5;">大写字母组成的长段落很难读。我们靠单词的整体形状识别词义，而全大写恰恰抹掉了形状。</div>`,

  'pure-black-white': `<div style="background: #ffffff; padding: 16px 18px; color: #000000; font-family: system-ui, sans-serif; font-size: 14px;"><div style="font-weight: 600; margin-bottom: 4px;">纯黑配纯白</div><div style="font-size: 12px; color: #000;">自然界里两者都不存在。总要带点色调。</div></div>`,

  'gray-on-color': `<div style="background: oklch(60% 0.20 265); padding: 16px 18px; border-radius: 6px; font-family: system-ui, sans-serif;"><div style="color: #9ca3af; font-size: 13px;">彩色背景上的灰色文字。发灰发白，难以阅读。</div></div>`,

  'low-contrast': `<div style="background: #fff; padding: 16px 18px; font-family: system-ui, sans-serif;"><div style="color: #d4d4d4; font-size: 13px;">白底上的浅灰文字。对比度 1.6:1，不达 WCAG。</div></div>`,

  'layout-transition': `<div style="font-family: system-ui, sans-serif; color: #111; display: flex; align-items: center; gap: 10px;"><div style="background: oklch(65% 0.22 265); border-radius: 6px; animation: janky 1.2s ease-in-out infinite; width: 60px; height: 30px;"></div><div style="font-size: 12px; color: #555;">对宽高做动画造成布局抖动。</div><style>@keyframes janky { 0%,100% { width: 60px; } 50% { width: 120px; } }</style></div>`,

  'cramped-padding': `<div style="font-family: system-ui, sans-serif;"><button style="background: #111; color: #fff; border: none; border-radius: 4px; padding: 2px 6px; font-size: 13px; font-weight: 500;">立即购买</button> <span style="color: #555; font-size: 12px; margin-left: 8px;">2px 垂直内边距。</span></div>`,

  'tight-leading': `<div style="font-family: system-ui, sans-serif; font-size: 13px; color: #111; line-height: 1.0; max-width: 220px;">过紧行距让多行正文显得拥挤，眼睛也难以在行间追踪。</div>`,

  'skipped-heading': `<div style="font-family: system-ui, sans-serif; color: #111;"><h1 style="font-size: 20px; font-weight: 700; margin: 0 0 4px;">页面标题（h1）</h1><h3 style="font-size: 13px; font-weight: 600; margin: 0; color: #555;">小节（h3），跳过了 h2</h3></div>`,

  'justified-text': `<div style="font-family: system-ui, sans-serif; font-size: 12px; color: #111; text-align: justify; max-width: 230px; line-height: 1.5;">屏幕上的两端对齐会制造成片的空白，因为浏览器的连字符断行并不可靠。这招留给印刷品吧。</div>`,

  'tiny-text': `<div style="font-family: system-ui, sans-serif; color: #111;"><div style="font-size: 15px; margin-bottom: 6px;">常规正文</div><div style="font-size: 9px; color: #555;">然后是 9 像素的小字，没人会真的去读。</div></div>`,

  'wide-tracking': `<div style="font-family: system-ui, sans-serif; font-size: 13px; color: #111; letter-spacing: 0.22em; max-width: 230px; line-height: 1.6;">正文的过宽字距打散了自然的字符组合，拖慢阅读。</div>`,

  'line-length': `<div style="font-family: system-ui, sans-serif; font-size: 13px; color: #111; line-height: 1.55; max-width: 100%;">一行超过约 75 个字符的段落会让人疲劳，因为眼睛要跨过很远的距离才能回到下一行的行首，期间早已丢了位置。</div>`,

  // ── LLM-only rule visuals ─────────────────────────────────────────

  'monospace-as-technical': `<div style="font-family: 'Courier New', monospace; color: #111;"><div style="font-size: 18px; font-weight: 700; margin-bottom: 6px;">TECHNICAL_TOOL</div><div style="font-size: 11px; color: #555;">用等宽字体装"开发者"气质。偷懒。</div></div>`,

  'dark-mode-default': `<div style="background: #0f1117; padding: 18px; border-radius: 8px; font-family: system-ui, sans-serif;"><div style="color: #e5e7eb; font-size: 14px; font-weight: 600; margin-bottom: 4px;">默认深色</div><div style="color: #9ca3af; font-size: 11px;">默认深色是在逃避做一个决定。</div></div>`,

  'everything-in-cards': `<div style="background: #fff; border: 1px solid #e8e4df; border-radius: 8px; padding: 10px;"><div style="background: #fff; border: 1px solid #e8e4df; border-radius: 6px; padding: 8px; font-family: system-ui, sans-serif; font-size: 12px; color: #111;"><div style="background: #fff; border: 1px solid #e8e4df; border-radius: 4px; padding: 6px;">标题</div></div><div style="background: #fff; border: 1px solid #e8e4df; border-radius: 6px; padding: 8px; margin-top: 6px; font-family: system-ui, sans-serif; font-size: 11px; color: #555;">任何东西都要套张卡片。</div></div>`,

  'identical-card-grids': `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-family: system-ui, sans-serif;">${'<div style="background: #fff; border: 1px solid #e8e4df; border-radius: 6px; padding: 10px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px;"><div style="width: 18px; height: 18px; background: oklch(62% 0.20 265); border-radius: 4px;"></div><div style="font-size: 10px; font-weight: 600; color: #111;">功能</div><div style="font-size: 9px; color: #888;">短文案。</div></div>'.repeat(6)}</div>`,

  'hero-metric-layout': `<div style="font-family: system-ui, sans-serif; text-align: left;"><div style="font-size: 42px; font-weight: 800; background: linear-gradient(135deg, oklch(65% 0.25 265), oklch(65% 0.25 340)); -webkit-background-clip: text; background-clip: text; color: transparent; line-height: 1;">10M+</div><div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px;">活跃用户</div><div style="display: flex; gap: 14px; margin-top: 10px; font-size: 10px; color: #555;"><span><strong>99.9%</strong> 在线率</span><span><strong>200ms</strong> p50</span></div></div>`,

  'glassmorphism': `<div style="position: relative; width: 100%; height: 100%; background: linear-gradient(135deg, oklch(70% 0.22 265), oklch(70% 0.25 340)); border-radius: 10px; overflow: hidden; display: flex; align-items: center; justify-content: center;"><div style="background: rgba(255,255,255,0.25); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.4); border-radius: 10px; padding: 14px 18px; color: #fff; font-family: system-ui, sans-serif; font-size: 12px; font-weight: 600; box-shadow: 0 8px 30px rgba(0,0,0,0.12);">磨砂玻璃卡片</div></div>`,

  'sparkline-decoration': `<div style="background: #fff; border: 1px solid #e8e4df; border-radius: 8px; padding: 14px 16px; width: 220px; font-family: system-ui, sans-serif;"><div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;"><div><div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.08em;">营收</div><div style="font-size: 20px; font-weight: 700; color: #111;">$42.1k</div></div><svg width="60" height="28" viewBox="0 0 60 28" style="flex-shrink: 0;"><polyline points="0,20 10,18 20,22 30,10 40,14 50,6 60,12" stroke="oklch(62% 0.22 265)" stroke-width="2" fill="none"/></svg></div><div style="font-size: 10px; color: #888;">小小的图表，没有真实信息。</div></div>`,

  'generic-drop-shadows': `<div style="display: flex; gap: 10px;"><div style="background: #fff; border: 1px solid #e8e4df; border-radius: 10px; width: 70px; height: 70px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);"></div><div style="background: #fff; border: 1px solid #e8e4df; border-radius: 10px; width: 70px; height: 70px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);"></div><div style="background: #fff; border: 1px solid #e8e4df; border-radius: 10px; width: 70px; height: 70px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);"></div></div>`,

  'modal-reflex': `<div style="position: relative; width: 100%; height: 100%; background: #f5f3ef; border-radius: 8px; overflow: hidden;"><div style="position: absolute; inset: 0; background: rgba(0,0,0,0.35);"></div><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; border-radius: 8px; padding: 14px 18px; width: 200px; font-family: system-ui, sans-serif; box-shadow: 0 20px 60px rgba(0,0,0,0.2);"><div style="font-size: 13px; font-weight: 600; color: #111; margin-bottom: 4px;">确定吗？</div><div style="font-size: 11px; color: #666; margin-bottom: 8px;">真的、真的想好了吗？</div><div style="display: flex; gap: 6px; justify-content: flex-end;"><div style="background: #eee; color: #555; padding: 4px 8px; border-radius: 4px; font-size: 10px;">取消</div><div style="background: oklch(60% 0.22 265); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 10px;">确定</div></div></div></div>`,

  'every-button-primary': `<div style="display: flex; flex-direction: column; gap: 6px; font-family: system-ui, sans-serif;"><div style="display: flex; gap: 6px;"><button style="background: oklch(60% 0.22 265); color: #fff; border: none; border-radius: 5px; padding: 6px 12px; font-size: 11px; font-weight: 600;">保存</button><button style="background: oklch(60% 0.22 265); color: #fff; border: none; border-radius: 5px; padding: 6px 12px; font-size: 11px; font-weight: 600;">取消</button><button style="background: oklch(60% 0.22 265); color: #fff; border: none; border-radius: 5px; padding: 6px 12px; font-size: 11px; font-weight: 600;">删除</button></div><div style="font-size: 10px; color: #888;">每个操作都在同样大声嚷嚷。</div></div>`,

  'redundant-headers': `<div style="font-family: system-ui, sans-serif; color: #111; max-width: 230px;"><div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">概览</div><div style="font-size: 11px; color: #555; line-height: 1.5;">这是概览小节，为概览提供一个概览。</div></div>`,

  'mobile-amputation': `<div style="font-family: system-ui, sans-serif;"><div style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #fff; border: 1px solid #e8e4df; border-radius: 6px; margin-bottom: 4px; font-size: 12px; color: #999; text-decoration: line-through;"><span>导出 CSV</span></div><div style="font-size: 10px; color: #888; margin-top: 4px;">"移动端暂不支持。"</div></div>`,
};

/**
 * Anti-patterns that live in the /impeccable skill's DON'T list but
 * don't have a deterministic detector. These can only be caught by
 * /critique running an LLM assessment pass.
 *
 * Each entry looks like a detection rule: id, category, name,
 * description, skillSection. The generator merges these into the
 * grouped sections alongside detected rules with an 'llm' layer badge.
 */
// ─── Gallery: real examples in the wild ──────────────────────────────

/**
 * Curated real-world examples of anti-patterns caught in the wild.
 * Each entry maps to:
 *   - public/antipattern-images/{id}.png  (preview thumbnail)
 *   - public/antipattern-examples/{id}.html  (standalone live example)
 * Rendered as a dedicated section on the /anti-patterns page, replacing
 * the old /gallery route which was confusingly labeled in the top nav.
 */
export const GALLERY_ITEMS = [
  {
    id: 'purple-gradients',
    title: '到处都是紫色渐变',
    desc:
      'AI 配色：万物皆紫蓝渐变。按钮、文字、背景、光球，一个不落。新的"让它再亮眼一点"。',
  },
  {
    id: 'lazy-cool',
    title: '偷懒的"酷"',
    desc:
      '玻璃拟态、霓虹光晕、模糊光球、满屏等宽字体。看起来像黑客马拉松作品，而不是产品。',
  },
  {
    id: 'lazy-impact',
    title: '偷懒的"冲击力"',
    desc:
      '拿不定主意就把一切都动起来。弹跳的按钮、扭动的图标、渐变文字、漂浮的徽章。没有意义的动效。',
  },
  {
    id: 'thick-border-cards',
    title: '侧边彩条卡片',
    desc:
      '圆角卡片一侧的粗彩色描边。AI 生成界面最容易被认出的破绽，没有之一。',
  },
  {
    id: 'cardocalypse',
    title: '卡片末日',
    desc:
      '卡片套卡片套卡片。五层嵌套，每层都自带内边距和阴影。',
  },
  {
    id: 'layout-templates',
    title: '复制粘贴式版式',
    desc:
      '同一个首屏-指标-功能网格模板换个配色反复用。每个区块都长一样时，就什么都不突出了。',
  },
  {
    id: 'inter-everywhere',
    title: 'Inter 铺天盖地',
    desc:
      '一款字体包打天下。标题、正文、标签、按钮全用它。没有字体排印层级，没有个性，没有设计。',
  },
  {
    id: 'massive-icons',
    title: '巨型图标',
    desc:
      '图标容器比它所介绍的内容还大。装饰比信息还抢眼时，优先级就反了。',
  },
  {
    id: 'bad-contrast',
    title: '糟糕的对比度选择',
    desc:
      '彩色背景上的灰色文字、低对比度标签、没法读的组合。好看和易读不该互相冲突。',
  },
  {
    id: 'redundant-ux-writing',
    title: '冗余的 UX 文案',
    desc:
      '标签、副标签、帮助文字、提示文字，用略有差异的措辞说同一件事。说一次，把它说好。',
  },
  {
    id: 'modal-abuse',
    title: '弹窗滥用',
    desc:
      '复杂设置塞进弹窗。要是它需要滚动条和三栏布局，它就该拥有自己的页面。',
  },
];

// ─── LLM-only rules ──────────────────────────────────────────────────

export const LLM_ONLY_RULES = [
  {
    id: 'monospace-as-technical',
    category: 'slop',
    name: '把等宽字体当"技术感"用',
    description:
      '用等宽字体来暗示"开发者/技术"气质。请做真正的字体选择，而不是套用懒惰的刻板印象。',
    skillSection: 'Typography',
  },
  {
    id: 'dark-mode-default',
    category: 'slop',
    name: '为了"保险"默认暗色模式',
    description:
      '为了保险而默认浅色模式，和为了显得酷而默认暗色模式是同一件事的两面——都是在逃避做一个决定。',
    skillSection: 'Color & Contrast',
  },
  {
    id: 'everything-in-cards',
    category: 'slop',
    name: '什么都装进卡片',
    description:
      '不是每段内容都需要带边框的容器。间距和对齐不用卡片就能完成视觉分组。',
    skillSection: 'Layout & Space',
  },
  {
    id: 'identical-card-grids',
    category: 'slop',
    name: '一模一样的卡片网格',
    description:
      '同样大小的卡片，图标 + 标题 + 文字无限重复。AI 首页的默认版式。',
    skillSection: 'Layout & Space',
  },
  {
    id: 'hero-metric-layout',
    category: 'slop',
    name: '首屏大数字版式',
    description:
      '大数字、小标签、三个辅助数据，再加一道渐变强调。到处都在用，没人真的信。',
    skillSection: 'Layout & Space',
  },
  {
    id: 'glassmorphism',
    category: 'slop',
    name: '满屏玻璃拟态',
    description:
      '模糊效果、玻璃卡片和发光描边被当作装饰使用，而不是用来解决真实的层级问题。',
    skillSection: 'Visual Details',
  },
  {
    id: 'sparkline-decoration',
    category: 'slop',
    name: '装饰性迷你图表',
    description:
      '看起来很讲究、却传达不出任何有效信息的小图表。如果数据重要，就给它空间。',
    skillSection: 'Visual Details',
  },
  {
    id: 'generic-drop-shadows',
    category: 'slop',
    name: '圆角矩形配通用投影',
    description:
      '网络上最保险、最容易被遗忘的形状。可能是任何 AI 的输出。请采用更有态度的视觉处理。',
    skillSection: 'Visual Details',
  },
  {
    id: 'modal-reflex',
    category: 'slop',
    name: '条件反射式弹窗',
    description:
      '弹窗打断用户，作为设计默认是一种偷懒。只有当这次交互真的没有更好的容身之处时才用它。',
    skillSection: 'Visual Details',
  },
  {
    id: 'every-button-primary',
    category: 'quality',
    name: '每个按钮都是主按钮',
    description:
      '当每个按钮看起来同等重要时，什么都读不出主操作。请用幽灵按钮、文字链接和次级样式建立层级。',
    skillSection: 'Interaction',
  },
  {
    id: 'redundant-headers',
    category: 'quality',
    name: '冗余信息',
    description:
      '复述标题的引言。重复页面标题的区块标签。复述自己说明文字的卡片。让每个词都挣得自己的位置。',
    skillSection: 'Interaction',
  },
  {
    id: 'mobile-amputation',
    category: 'quality',
    name: '在移动端砍功能',
    description:
      '因为麻烦就把关键功能从移动端藏起来。请让界面适配场景，而不是把它截肢。',
    skillSection: 'Responsive',
  },
];
