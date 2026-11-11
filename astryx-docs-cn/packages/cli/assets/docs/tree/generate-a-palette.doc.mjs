// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/themes/generate-a-palette`:
 * turn a few seed colors into a full light and dark color palette.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'generate-a-palette',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 20},
  title: '生成调色板',
  category: 'guide',
  description:
    '把几粒种子色扩展成完整的浅色与深色色阶，保存在主题文件夹中。',
  sections: [
    {
      id: 'generate-a-palette',
      title: '生成调色板',
      content: [
        {
          type: 'prose',
          text: '主题需要几十个相互关联的颜色——每个品牌色在浅色与深色模式下用于背景、边框、文本与状态的色阶。调色板就是这整套色阶。与其逐一手选，不如写定几粒种子色并生成其余部分，让色阶保持一致。',
        },
        {
          type: 'prose',
          text: '你先写一份简短配置，写明每个颜色族及其种子色，然后运行 `theme palette generate`。它会把每粒种子扩展成完整的浅色与深色色阶（shade 的梯度），并把结果写入主题文件夹，你的主题令牌就指向那里（见 {@link generic:define-the-theme}）。请把配置与生成的调色板一起放在该文件夹中。',
        },
        {
          type: 'prose',
          text: '最小的配置只有一个颜色族：一个 `id` 作为名称，一个 `seed` 颜色作为生长起点。把它保存为 `themes/ocean/palette.config.json`：',
        },
        {
          type: 'code',
          lang: 'json',
          code: '{"families": [{"id": "ocean", "seed": "#0074e2"}]}',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `# Print the palette without writing files
{@command theme palette generate themes/ocean/palette.config.json}
# Write the palette and its receipt
astryx theme palette generate themes/ocean/palette.config.json \\
  --out themes/ocean/tokens/ocean.palette.ts`,
        },
        {
          type: 'code',
          lang: 'text',
          code: `[ok] Wrote themes/ocean/tokens/ocean.palette.ts

[ok] Wrote themes/ocean/tokens/ocean.palette.receipt.json

Review and edit the candidate before adopting it as theme-owned palette data.`,
        },
        {
          type: 'prose',
          text: '该命令会写入两个文件。`ocean.palette.ts` 是你的主题令牌将要读取的调色板：它导出 `black`、`white` 与 `palette`——为 `light` 和 `dark` 各提供 21 个色阶的梯度（停靠点 `0` 到 `100`）。旁边的 `.receipt.json` 记录确切的种子与设置，便于日后重新生成同一调色板。除非传入 `--overwrite`，再次运行不会改动这两个文件。',
        },
        {
          type: 'prose',
          text: '追加 `--preview <file>.html` 还能得到一个展示每个色阶的网页，方便你在浏览器里直观查看调色板。请把它写到 `themes/` 之外，避免随包发布。所有选项见 {@link command:theme palette generate}，它读取的配置在 {@link function:generateTonalPalette} 中描述。',
        },
      ],
    },
  ],
};
