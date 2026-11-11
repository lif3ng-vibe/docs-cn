// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DialogHeroHeaderShowcase.doc.mjs
 * @input DialogHeroHeaderShowcase.tsx
 * @output Showcase ownership and preview metadata
 * @position Lab integration template registration for DialogHeroHeader
 */

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'DialogHeroHeader',
  displayName: 'Dialog Hero Header',
  description:
    '一个上手引导对话框：全幅出血的插画作品，关闭按钮叠放其上。',
  exampleFor: 'DialogHeroHeader',
  isShowcase: true,
  aspectRatio: 4 / 3,
  componentsUsed: [
    'DialogHeroHeader',
    'Dialog',
    'Layout',
    'LayoutContent',
    'LayoutFooter',
    'Button',
    'Text',
  ],
};
