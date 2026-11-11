// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling-libraries/non-css-processing`: resolve token
 * values outside the DOM for charts, canvas, SVG, and config objects.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'non-css-processing',
  title: '非 CSS 场景的取值',
  placement: {parent: 'namespace:styling-libraries', slot: 'guides', order: 40},
  category: 'guide',
  description:
    '用 resolveThemeTokens() 与 useTheme() 在 DOM 之外解析 token 值，供图表、canvas、SVG 与配置对象使用。',
  keywords: [
    'resolveThemeTokens',
    'resolveThemeToken',
    'useTheme',
    '图表',
    'canvas',
    'SVG',
    '非 CSS',
  ],

  sections: [
    {
      title: '非 CSS 场景的取值',
      content: [
        {
          type: 'prose',
          text: '当 React 之外的代码需要已知主题与模式下的 token 值时，用 `resolveThemeTokens()` 或 `resolveThemeToken()`。当取值应来自最近的 Theme 与当前生效模式时，在客户端组件内用 `useTheme()`。',
        },
        {
          type: 'code',
          lang: 'ts',
          label: '不依赖 React 上下文解析 token',
          code: `import {resolveThemeTokens} from '@astryxdesign/core/theme/tokens';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

const tokens = resolveThemeTokens(neutralTheme, {mode: 'light'});

const chartOptions = {
  textColor: tokens['--color-text-primary'],
  mutedTextColor: tokens['--color-text-secondary'],
  gridColor: tokens['--color-border'],
  seriesColors: [
    tokens['--color-data-categorical-blue'],
    tokens['--color-data-categorical-orange'],
    tokens['--color-data-categorical-purple'],
  ],
};`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '从最近的 Theme 解析 token',
          code: `'use client';

import {useMemo} from 'react';
import {useTheme} from '@astryxdesign/core/theme';

function RevenueChart({data}: {data: Array<{x: string; y: number}>}) {
  const {mode, tokens} = useTheme();

  const chartOptions = useMemo(
    () => ({
      mode,
      textColor: tokens['--color-text-primary'],
      mutedTextColor: tokens['--color-text-secondary'],
      gridColor: tokens['--color-border'],
      seriesColors: [
        tokens['--color-data-categorical-blue'],
        tokens['--color-data-categorical-orange'],
        tokens['--color-data-categorical-purple'],
      ],
    }),
    [mode, tokens],
  );

  return <ThirdPartyChart data={data} options={chartOptions} />;
}`,
        },
      ],
    },
    {
      id: 'non-css-best-practices',
      title: '非 CSS 场景取值的最佳实践',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            '把返回的 `tokens` 对象作为 memo 依赖使用；在当前主题或模式变化之前它是稳定的。',
            '图表系列使用 `--color-data-categorical-blue` 这类数据可视化 token，而不是复用任意的 UI 颜色。',
            'SVG 元素尽可能用 CSS 变量（`fill="var(--color-accent)"`）；当 API 在 JavaScript 里要求字符串值时，再用 token 解析 API。',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            '把 token 解析 API 用于普通 DOM 样式。普通 DOM 样式请用 CSS 变量、StyleX token、xstyle 或库别名。',
            '假设返回值反映了每一条 CSS 级联覆盖。它们只解析当前主题与模式下的 token；局部的媒体表面覆盖与任意 CSS 覆盖可能不会体现在返回的映射里。',
          ],
        },
      ],
    },
  ],
};
