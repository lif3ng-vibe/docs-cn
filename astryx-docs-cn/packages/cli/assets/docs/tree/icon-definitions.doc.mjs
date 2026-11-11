// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/experimental/icon-definitions`: every icon
 * definition, Astryx's and, in a project that sets `experimental.iconSet`,
 * each installed icon set's own. Experimental
 * (spec:AST-017 FR27), with the icon sets that use them.
 *
 * It never lists its children: it adopts every icon definition doc from every
 * package, so a new definition file appears here with no edit to this file.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'icon-definitions',
  placement: {parent: 'namespace:experimental', slot: 'guides', order: 20},
  stability: 'experimental',
  title: '图标定义',
  summary:
    '所有图标定义：图标所代表的事物，以及各图标集将其图标映射到的共享名称。',
  keywords: [
    '图标定义',
    '图标定义列表',
    '图标名称',
    '选哪个图标',
    '图标映射',
  ],
  slots: {
    definitions: {title: '定义', accepts: {kinds: ['icon-definition']}},
  },
  adopts: [
    {
      source: {
        group: 'icon-definitions',
        kinds: ['icon-definition'],
        packages: 'all',
      },
      into: 'definitions',
    },
  ],
  blocks: [
    {
      type: 'prose',
      text: '图标定义是图标所代表的一件事物，例如 `close` 或 `delete`。每个图标集都在其数据文件的 `map` 中围绕定义注册自己的图标，而模板则是围绕定义编写的，因此切换图标集的项目可以从新集合得到相同的定义。标记为 [built-in] 的内置定义是 Core 渲染所用的共享名称（即 `astryx docs icons` 中的语义图标名称）；每个集合都必须映射它们，否则 `integration check` 会失败。其余定义是可选的：你的库画了哪个就映射哪个。`map` 以 camelCase 名称作为定义的 key，显示在 id 之后（`eyeSlash`）；`experimental icon map` 与 `--pairs` 接受两种拼写。图标集可以添加自己的定义；在设置了 `experimental.iconSet` 的项目中，它们会连同所属包一起列在这里。`astryx experimental icon <definition>` 可以找到每个已安装集合为该定义绘制的图标。图标定义是实验性的：可能在补丁版本中更改或移除。',
    },
  ],
};
