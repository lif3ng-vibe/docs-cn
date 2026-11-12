// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'browser-support',
  title: '浏览器支持',
  category: 'guide',
  description:
    'Astryx 面向哪些浏览器，依赖哪些现代平台特性，以及如何为你自己的受众支持旧浏览器。',

  sections: [
    {
      title: '概览',
      content: [
        {
          type: 'prose',
          text: 'Astryx 构建在现代 Web 平台特性之上：[`Popover`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) API、CSS 锚点定位（anchor positioning）与 CSS `light-dark()`。这些特性让组件保持小巧、无障碍且零依赖，但也划定了能正确渲染一切的浏览器底线。',
        },
        {
          type: 'prose',
          text: '设计系统并不拥有自己的流量；构建于其上的产品才拥有。它们的受众五花八门——从只用常青版 Chrome 的内部工具，到旧版 Safari 占相当份额的公开站点。因此 Astryx 不会像应用那样宣布单一硬性浏览器底线，而是定义若干分级，描述各级别下哪些能力可用，并把最终决定权交给你。选择与你受众匹配的分级即可。',
        },
      ],
    },
    {
      title: '支持分级',
      content: [
        {
          type: 'prose',
          text: 'Astryx 官方支持 Tier 1 与 Tier 2。Tier 3 尽力而为：组件不会崩溃，但定位与主题可能降级。',
        },
        {
          type: 'table',
          headers: [
            '分级',
            'Baseline',
            '代表版本',
            '你的用户会遇到什么',
          ],
          rows: [
            [
              'Tier 1：完整保真',
              '当前 Baseline（2026）',
              'Chrome 125+, Edge 125+, Safari 26+, Firefox 147+',
              '一切正常，包括 CSS 锚点定位。这是基准目标。',
            ],
            [
              'Tier 2：功能可用',
              'Baseline − 2 年（2024）',
              'Chrome 114+, Edge 114+, Safari 17+, Firefox 125+',
              '组件能打开、关闭并完全可用。只缺锚点定位，因此分层表面（工具提示、菜单、弹出层）可能不会定位在其触发器旁边。',
            ],
            [
              'Tier 3：低于 Tier 2',
              '早于 Baseline − 2',
              '更旧的任何版本',
              '尽力而为。唯一的保证是“不会崩溃”。`light-dark()` 不可用，因此主题颜色可能回退到默认值。',
            ],
          ],
        },
      ],
    },
    {
      title: '哪些特性决定了底线',
      content: [
        {
          type: 'prose',
          text: '只有三项现代特性带有浏览器要求。Astryx 使用的其余一切（`:has()`、`color-mix()`、容器查询、`<dialog>` 元素）自 2023 年或更早已广泛可用，无需特殊处理。',
        },
        {
          type: 'table',
          headers: ['特性', '在 Astryx 中的作用', '广泛可用时间'],
          rows: [
            [
              'CSS Anchor Positioning',
              '让分层表面相对其触发器定位（工具提示、菜单、弹出层、下拉菜单）。',
              'Baseline 2026：最紧的要求。',
            ],
            [
              '`Popover` API',
              '通过 top layer 打开、堆叠分层表面并实现轻触关闭（light-dismiss）。',
              'Baseline 2025。',
            ],
            [
              'CSS light-dark()',
              '把每个主题颜色元组编译为单一取值，并随配色方案响应。它是整个主题系统的基石。',
              '自 2024 年年中起广泛可用。',
            ],
          ],
        },
        {
          type: 'prose',
          text: '真正要紧的差距在 Tier 1 与 Tier 2 之间：`Popover` API 与 `light-dark()` 达到广泛可用远早于锚点定位。因此在 Tier 2 浏览器中，分层表面能正确打开与关闭；只是没有定位。这是大多数使用者唯一需要认真考虑的特性。',
        },
      ],
    },
    {
      title: '哪些组件受影响',
      content: [
        {
          type: 'prose',
          text: '任何会打开菜单、弹出层、工具提示或下拉菜单的组件都带有该浏览器要求：它把该表面渲染为贴合其触发器定位的浮层。包括：',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Tooltip、HoverCard 与 Popover，以及任何会展示它们的 prop（例如 Button 的 `tooltip`）',
            'DropdownMenu、MoreMenu 与 ContextMenu',
            'Selector、MultiSelector、ComplexSelector、Typeahead 与 PowerSearch（下拉表面）',
            'DateInput、DateRangeInput 与 DateTimeInput（日历弹出层）',
            'Tokenizer（建议菜单）',
            'Breadcrumbs、TabList、TopNav 与 SideNav 中的溢出菜单与飞出菜单',
            'Carousel（锚定控件）',
          ],
        },
        {
          type: 'prose',
          text: '如果你的产品不打开任何菜单、弹出层、工具提示或下拉菜单，就没有锚点定位要求；只需 `light-dark()`（Tier 2 及以上）即可获得正确的主题颜色。页面布局、排版、表单、按钮、卡片与表格在低至 Tier 2 的范围内都能正常工作，无需特殊处理。',
        },
      ],
    },
    {
      title: 'Astryx 保证什么',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            '组件绝不会因平台 API 缺失而抛错。浏览器缺少 `Popover` API 时，分层回退为普通的可见性切换，而不是崩溃。',
            'Tier 1 与 Tier 2 受官方支持并经测试。',
            '非分层组件在低至 Tier 2 的范围内渲染正确。',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Astryx 不保证 Tier 1 以下（锚点定位）的分层定位正确。为 Tier 2 受众补上这一差距由使用者自行选择；见下文。',
            'Astryx 不内置 `light-dark()` 回退，因此 Tier 2 以下不保证主题颜色。',
          ],
        },
      ],
    },
    {
      title: '屏幕键盘',
      content: [
        {
          type: 'prose',
          text: "在手机上\，响应屏幕键盘的组件\—\—完全展开的 `height='tall'` BottomSheet 与 ChatLayout 的输入区\—\—以同样的方式测量它\：布局视口高度减去视觉视口高度乘以其缩放系数\。在视觉视口为键盘收缩的浏览器里\（iOS 上的 Safari\—\—无论浏览器内还是主屏应用\、Android 上的 Firefox 与 Chrome\）\，它们让聚焦字段及其周围表面保持在键盘上方\，页面留在原处\。若 Android 版 Firefox 平移到了字段\，它们会在几帧内把页面放回原位\。",
        },
        {
          type: 'prose',
          text: '在 Android 的 Chrome 中\，ChatLayout 的输入区随 Gboard 的滑上滑下贴着键盘移动\。Tall BottomSheet 的聚焦字段在 Gboard 滑上时贴着键盘\，在字段失焦后 Gboard 滑下时也随之贴下\。滚动余量会保留到键盘收起\。Chrome 报告较晚的隐藏事件\—\—例如仍保持焦点的 Back\—\—则从 Chrome 的报告开始贴着滑下\。键盘被报告时\，BottomSheet 会在同一帧把字段安放在键盘正上方\，因此 Chrome 没有被遮挡的字段可平移\；若 Chrome 仍然平移\，BottomSheet 会在平移结束时把页面放回\。Chrome 遵循你的 viewport 设置\—\—Astryx 只在文档中说明\、从不设置\：viewport `<meta>` 元素归你的应用所有\。默认情况下\（`interactive-widget=resizes-visual`\）Chrome 把键盘覆盖在页面之上\，并平移到页面上其他位置的聚焦字段\。使用 `interactive-widget=resizes-content` 时\，它改为收缩布局视口\，于是锚定在底部的内容位于键盘上方\，这些组件测不到键盘\，也就不做任何改变\：浏览器已经腾出了空间\。',
        },
        {
          type: 'code',
          lang: 'html',
          label: 'Android 的 Chrome 为键盘调整页面大小',
          code: `<meta
  name="viewport"
  content="width=device-width, initial-scale=1, interactive-widget=resizes-content" />`,
        },
      ],
    },
    {
      title: '支持旧浏览器',
      content: [
        {
          type: 'prose',
          text: '如果你的受众包含 Tier 2 浏览器，而你需要正确的分层定位，有三种选择，按成本从低到高排列。这些都是你为自己的受众做的决定；Astryx 不强加任何一种。',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            '给锚点定位加 polyfill。在 `@supports` 检查之后按条件加载 CSS 锚点定位 polyfill，在 Tier 1 上零开销。这是获得正确定位的最省力途径；polyfill 可能覆盖不了每一个 position-fallback 特性。',
            '提供 JS 定位回退。用 `CSS.supports("anchor-name", "--x")` 检测支持缺失，返回 false 时改用基于测量的库（例如浮动元素定位器）为分层定位。代码更多，但完全可控。',
            '接受降级的定位。向你的用户说明：在 Tier 2 浏览器上，分层表面能正确打开，但可能不在触发器旁边。成本最低，对常青浏览器上的内部工具往往就够了。',
          ],
        },
        {
          type: 'prose',
          text: '在运行时做特性检测，而不是嗅探 user agent：',
        },
        {
          type: 'code',
          lang: 'js',
          label: '特性检测',
          code: `// Popover API (Tier 2 and up)
const hasPopover = typeof HTMLElement !== 'undefined'
  && typeof HTMLElement.prototype.showPopover === 'function';

// CSS anchor positioning (Tier 1)
const hasAnchorPositioning = CSS.supports('anchor-name', '--x');

// CSS light-dark() (Tier 2 and up)
const hasLightDark = CSS.supports('color', 'light-dark(#000, #fff)');`,
        },
      ],
    },
    {
      title: '这些分级如何随时间演进',
      content: [
        {
          type: 'prose',
          text: '这些分级是滚动的，并未冻结在具体版本上。它们跟随 Web Baseline 年份：',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Tier 1 跟随当前 Baseline 年份。',
            'Tier 2 跟随 Baseline 减两年。',
            'Tier 3 是更旧的一切，始终尽力而为。',
          ],
        },
        {
          type: 'prose',
          text: '这个窗口并非随意划定：Baseline − 2 大致落在锚点定位不再可用、而 `Popover` API 与 `light-dark()` 仍然可用的位置，因此分级边界追踪的是真实的能力边界，不是猜出来的日期。上述版本底线大约每年评审并推进一次，随新的 Baseline 年份落地。请始终做特性检测而不是硬编码版本号，这样你的应用会随平台演进而自动适应。',
        },
      ],
    },
  ],
};
