// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs internationalization/i18n-calendars`: the short version of
 * showing dates in another calendar. The `calendars` namespace holds the
 * detail.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'i18n-calendars',
  title: '其他历法',
  placement: {
    parent: 'namespace:internationalization',
    slot: 'guides',
    order: 25,
  },
  category: 'guide',
  description:
    '以波斯历、希伯来历、伊斯兰历、佛历、日本历等历法显示日期，同时取值保持为公历 ISO 日期。',

  sections: [
    {
      title: '以其他历法显示日期',
      content: [
        {
          type: 'prose',
          text: '在 `<InternationalizationProvider>` 上为子树设置 `calendar`，或直接设在 `Calendar` 上；不设置时 `Calendar` 使用公历。无论哪种历法，取值都保持公历 ISO 日期（`YYYY-MM-DD`）。',
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
          text: '大多数历法需要运行时的 `Temporal`。Safari 与较旧的运行时缺少它：在服务器与浏览器中都要加载 `temporal-polyfill/full/global`。缺少时这些历法会显示公历日期。支持的历法、服务端渲染与阴阳合历详见 {@link namespace:calendars}。',
        },
      ],
    },
  ],
};
