// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/themes/define-the-theme`:
 * map the palette to tokens, keep light-dark() to colors, and avoid Core internals.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'define-the-theme',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 30},
  title: '定义主题',
  category: 'guide',
  description:
    '把主题令牌指向调色板，让 light-dark() 只用于颜色，并避免触碰 Core 内部。',
  sections: [
    {
      id: 'map-the-palette-to-tokens',
      title: '把调色板映射到令牌',
      content: [
        {
          type: 'prose',
          text: '主题令牌是一个具名插槽，Astryx 组件从中读取取值——`--color-accent` 对应强调色，诸如此类。组件从不直接读取你的调色板；它们读取的是令牌。定义主题就是把每个令牌指向调色板的一个色阶，让组件呈现你的配色。',
        },
        {
          type: 'prose',
          text: '在 `oceanTheme.ts` 中导入调色板，并把你的令牌指向它的色阶。每个令牌接受一对 `[light, dark]` 值——浅色模式下使用的色阶与深色模式下的色阶。',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `// themes/ocean/oceanTheme.ts
import {defineTheme} from '@astryxdesign/core/theme';
import {palette} from './tokens/ocean.palette';

const {light, dark} = palette.ocean;

export const oceanTheme = defineTheme({
  name: 'ocean',
  tokens: {
    '--color-accent': [light['45'], dark['70']],
  },
});`,
        },
        {
          type: 'prose',
          text: '本地导入必须留在主题文件夹内。一旦离开该文件夹（如 `../../shared/colors`），构建会以 `invalid_theme` 失败，包中的所有主题都会从 `theme list` 中消失。`{@command theme template}` 会生成一个文件，解释 `defineTheme` 的每个字段。完整令牌集与组件主题定制请读 {@link generic:author-a-theme}。',
        },
      ],
    },
    {
      id: 'build-on-another-theme',
      title: '基于另一个主题构建',
      content: [
        {
          type: 'prose',
          text: '要让一个主题基于现有主题，就使用 `extends`：导入基础主题，只覆盖你要更改的令牌。用 `integration add theme ocean-contrast` 添加派生主题，并从基础主题的构建产物包导出中导入它，因为本地导入无法离开主题文件夹。派生主题与基础主题保持实时链接，重新构建时会吸收基础主题此后的更改——这与 `--from` 不同，后者会分叉出一份副本（{@link generic:add-a-theme}）。',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `// themes/ocean-contrast/oceanContrastTheme.ts
import {defineTheme} from '@astryxdesign/core/theme';
import {oceanTheme} from '@acme/astryx-widgets/themes/ocean';

export const oceanContrastTheme = defineTheme({
  name: 'ocean-contrast',
  extends: oceanTheme,
  tokens: {
    '--color-accent': ['#0051a3', '#4aa3ff'],
  },
});`,
        },
      ],
    },
    {
      id: 'keep-light-dark-to-colors',
      title: 'light-dark() 只用于颜色',
      content: [
        {
          type: 'prose',
          text: '每对 `[light, dark]` 都会编译为一个 `light-dark()` 值，它只切换颜色。请给它颜色。对于不是纯色的值——比如渐变——把 `light-dark()` 放在每个色标上，而不是包住整个值：`light-dark()` 接受两个颜色，包裹整个渐变会使该值在使用此令牌之处失效，而 `theme build` 不会发出警告。',
        },
      ],
    },
    {
      id: 'avoid-core-internals',
      title: '不要设置 Core 私有变量',
      content: [
        {
          type: 'prose',
          text: 'Core 私有变量以 `--_` 开头，例如 `--_field-radius`。它们属于内部实现，可能在任意 Core 版本中变更，因此 `theme build` 会把发现的每一个都报告为 `[error]`。请改为设置标准 CSS 属性——`borderRadius`、`padding`——让构建在 Core 需要之处生成内部变量。',
        },
      ],
    },
    {
      id: 'declare-the-peers',
      title: '声明 peer 依赖',
      content: [
        {
          type: 'prose',
          text: '主题导入了 `@astryxdesign/core/theme`，因此请把 Core 声明为 peer 依赖，版本范围取你实际测试过该主题的 Core 版本区间——用范围而非精确版本，这样 Core 发布补丁版本不会迫使你重新发布。`integration add theme` 已经声明了读取主题的可选 peer `@astryxdesign/cli`：',
        },
        {
          type: 'code',
          lang: 'json',
          code: `"peerDependencies": {
  "@astryxdesign/core": "^0.7.0",
  "@astryxdesign/cli": ">=0.6.4"
},
"peerDependenciesMeta": {
  "@astryxdesign/cli": {"optional": true}
}`,
        },
      ],
    },
  ],
};
