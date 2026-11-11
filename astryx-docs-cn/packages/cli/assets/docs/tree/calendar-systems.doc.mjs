// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs calendars/calendar-systems`: choosing a calendar, the
 * supported calendars, loading Temporal on the server and in the browser, the
 * lunisolar calendars, and week numbers.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'calendar-systems',
  title: '历法系统',
  placement: {
    parent: 'namespace:calendars',
    slot: 'guides',
    order: 10,
  },
  category: 'guide',
  description:
    '如何选择历法、哪些历法需要 Temporal、服务端渲染、阴阳历以及周数。',

  sections: [
    {
      title: '选择历法',
      content: [
        {
          type: 'prose',
          text: '除非你另行选择，`Calendar` 默认显示公历。向 `<InternationalizationProvider>` 传入 `calendar`，可为子树设置历法。仅靠 locale 永远不会改变历法：不传 `calendar="persian"` 时，`fa-IR` 会以波斯语显示公历日期。带 `-u-ca-` 关键字的 locale（如 `th-TH-u-ca-buddhist`）同样显示公历日期；请设置 `calendar` 来选择历法。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '波斯语界面中的波斯历日期',
          code: `import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {Calendar} from '@astryxdesign/core/Calendar';

<InternationalizationProvider locale="fa-IR" calendar="persian">
  {/* shows Aban 1405; value and onChange stay '2026-10-30' */}
  <Calendar value={date} onChange={setDate} />
</InternationalizationProvider>;`,
        },
        {
          type: 'prose',
          text: '历法与语言相互独立：`locale="en" calendar="hebrew"` 会以英语显示希伯来历日期。`Calendar` 还接受自己的 `calendar`，其优先级高于 provider。当一个屏幕需要并排显示两种历法时可以用它。',
        },
        {
          type: 'prose',
          text: '值永远不会随历法改变。无论使用哪种历法，`value`、`defaultValue`、`onChange`、`min` 和 `max` 都保持公历 ISO 日期（`YYYY-MM-DD`），因此你的数据、服务端代码和现有处理函数都能继续工作。',
        },
      ],
    },
    {
      title: '支持的历法',
      content: [
        {
          type: 'table',
          headers: ['历法', '标识符', '是否需要 Temporal'],
          rows: [
            ['公历', '`gregory`, `iso8601`', '否'],
            ['佛历（泰国）', '`buddhist`', '否'],
            ['民国纪年', '`roc`', '否'],
            ['日本历（年号）', '`japanese`', '否'],
            ['波斯历（太阳希吉来历）', '`persian`', '是'],
            ['印度国定历（塞迦）', '`indian`', '是'],
            ['希伯来历', '`hebrew`', '是'],
            [
              '伊斯兰历（希吉来历）',
              '`islamic-umalqura`, `islamic-civil`, `islamic-tbla`',
              '是',
            ],
            ['阴阳历', '`chinese`, `dangi`', '是'],
            ['科普特历', '`coptic`', '是'],
            ['埃塞俄比亚历', '`ethiopic`, `ethioaa`', '是'],
          ],
        },
        {
          type: 'prose',
          text: '其他任何标识符（如 `islamic`）都会显示公历日期，并在开发环境中警告一次。',
        },
      ],
    },
    {
      title: '在运行时缺少 Temporal 的地方加载它',
      content: [
        {
          type: 'prose',
          text: '月份体系非公历的历法使用运行时的 `Temporal` 来计算月长、闰月和年份。Chrome 与 Edge 144 及更高版本、Firefox 139 及更高版本、Node.js 26 及更高版本都自带它；Safari 和更旧的运行时则没有。Astryx 不打包任何 polyfill，因此公历应用毫无额外开销。',
        },
        {
          type: 'prose',
          text: '在缺少 `Temporal` 的地方，请在应用渲染前加载 `temporal-polyfill` 的完整构建。默认构建不包含非 ISO 历法。只在缺少 `Temporal` 的地方加载：对阴阳历而言，原生实现更精确。',
        },
        {
          type: 'code',
          lang: 'ts',
          label: '只在缺少 Temporal 的地方加载 polyfill',
          code: `// temporal-setup.ts: import before your app renders, on the server and in the browser
if (!('Temporal' in globalThis)) {
  await import('temporal-polyfill/full/global');
}`,
        },
        {
          type: 'prose',
          text: '如果在服务端渲染，那里也要加载。`Calendar` 在渲染期间解析其历法，因此没有 `Temporal` 的服务端会渲染公历日期，而带有 `Temporal` 的浏览器会渲染波斯历日期：水合（hydration）就会失败。当两端都有或都没有 `Temporal` 时，渲染出的标记一致。',
        },
        {
          type: 'prose',
          text: '如果缺少支持它的 `Temporal`，需要它的历法会显示公历日期，并在服务端和浏览器的开发环境中各警告一次。与公历对齐的历法（`buddhist`、`roc`、`japanese`）无需它即可在任何地方工作。',
        },
      ],
    },
    {
      title: '阴阳历',
      content: [
        {
          type: 'prose',
          text: '在阴阳历中，月份从天文计算出的新月开始，而不同运行时对其中少数新月的计算并不一致。Astryx 遵循运行时的 `Temporal`，不做修正。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Chrome、Edge、Firefox 与 Node.js 26 的原生 `Temporal` 与 1900 至 2100 年的官方天文台数据一致。',
            'polyfill 则读取平台的 `Intl` 数据。在 polyfill 下，Node.js 24 在该范围内有九个 `chinese` 月和四个 `dangi` 月的起始日期与原生结果相差一天：2027 年 `chinese` 年的首月，原生 `Temporal` 从 2 月 6 日开始，polyfill 则从 2 月 7 日开始。Safari 使用同类 `Intl` 数据，可预期存在相同差异。',
            '在同一个浏览器内，用户看到的日期数字、屏幕阅读器朗读的日期与其选择的值是一致的。只有两个不同运行时之间才可能不一致。',
          ],
        },
        {
          type: 'prose',
          text: '如果在服务端渲染，使用不同实现的服务端与浏览器可能在这些月份起始日上不一致。此时浏览器对该月的渲染与服务端标记不同，React 会在水合期间于客户端重新渲染这一部分。`temporal-polyfill/full/global` 导入在原生 `Temporal` 存在时会保留原生实现，因此仅靠它，Chrome、Edge 与 Firefox 仍用原生 `Temporal`，而 Node.js 24 服务端则用 polyfill。当这些历法的服务端与浏览器标记一致比匹配官方数据更重要时，请在渲染前于服务端和浏览器中调用 `temporal-polyfill/full/shim` 的 `installImplementation()`：它即便在原生 `Temporal` 之上也会安装 polyfill。带原生 `Temporal` 的服务端运行时（如 Node.js 26）同样能与原生浏览器保持一致。除此之外，不要替换原生 `Temporal`：那会让原生环境的精度变差。',
        },
      ],
    },
    {
      title: '周数',
      content: [
        {
          type: 'prose',
          text: '`Calendar` 的 `hasWeekNumbers` 会在任何历法中显示 ISO 8601 周数。Temporal 仅为 ISO 历法定义了周编号。',
        },
      ],
    },
  ],
};
