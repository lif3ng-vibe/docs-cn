// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/docs/extend-or-replace`:
 * take over an existing topic or guide with `replaces`, merge sections into
 * one with `extends` (placing each with `before` or `after`), and check
 * overlaps with Core topics.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'extend-or-replace',
  placement: {parent: 'namespace:docs', slot: 'guides', order: 40},
  title: '扩展或替换话题',
  category: 'guide',
  description: '接管一个话题或指南，或把小节合并进其中。',
  sections: [
    {
      id: 'replace-a-topic',
      title: '替换话题',
      content: [
        {
          type: 'prose',
          text: '设置 `replaces` 来接管一个现有话题，如 Core 的 `getting-started`。打开旧名称的读者会看到你的话题。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command integration add doc acme-getting-started --replaces getting-started}\n# The old name now opens your topic\n{@command docs getting-started}',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'docs/acme-getting-started.doc.mjs',
          code: "export default {\n  type: 'generic',\n  name: 'acme-getting-started',\n  replaces: 'getting-started',\n  title: 'Acme getting started',\n  description: 'Install Acme widgets and render your first carousel.',\n  sections: [/* ... */],\n};",
        },
        {
          type: 'prose',
          text: '文档列表会在原位置显示你的话题，取代旧话题。由于你的话题有自己的 `name`，旧名称仍会解析到它，因此学会了旧名称的链接和智能体仍会落到你的话题上。',
        },
      ],
    },
    {
      id: 'extend-a-topic',
      title: '扩展话题',
      content: [
        {
          type: 'prose',
          text: '设置 `extends` 把小节合并进现有话题，而不是接管它。匹配到基础小节的小节会替换它，没有匹配到的小节追加在末尾。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command integration add doc acme-theming --extends theme}\n{@command docs theme --index}',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'docs/acme-theming.doc.mjs',
          code: "export default {\n  type: 'generic',\n  name: 'acme-theming',\n  extends: 'theme',\n  title: 'Acme theming',\n  description: 'Theme an app that uses Acme widgets.',\n  sections: [\n    {id: 'quick-start', title: 'Quick Start', content: [/* replaces the base section */]},\n    {id: 'use-the-ocean-theme', title: 'Use the ocean theme', content: [/* added at the end */]},\n  ],\n};",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '用 `--index` 读取基础话题的键，并为执行替换的小节把该键作为它的 `id`。执行替换的小节保持原有位置。没有 `id` 的小节只匹配标题完全一致的基础小节，或 `id` 恰为其标题生成的键的基础小节，因此 `Integration Themes` 会添加在没有 `id` 的基础小节 `Integration themes` 旁边。',
            '把 `before` 或 `after` 设为某个基础小节的键，即可在该处而非末尾插入新小节。指向不存在小节的键会把新小节加到末尾，并且 `astryx doctor integration validate` 会列出一条提示。旧版 CLI 会拒绝这些字段，因此请声明一个从支持它们的版本起算的 `@astryxdesign/cli` peer 范围；缺少它时 `astryx integration verify` 会发出警告。',
            '话题保留基础话题的标题与描述，读者仍按基础话题的名称打开它。',
            '请替换 `integration add` 写入的 `Overview` 占位小节，否则它会被追加进基础话题。',
            '扩展话题用于纠错或增补。用 `replaces` 制作的副本不会再获得所有者的修复。',
          ],
        },
      ],
    },
    {
      id: 'replace-or-extend-a-cli-guide',
      title: '替换或扩展 CLI 指南',
      content: [
        {
          type: 'prose',
          text: 'CLI 文档树中的指南以路由而非话题名标识。把 `replaces` 或 `extends` 设为该路由，即可为每个安装你包的应用更改该指南：在智能体已在阅读的页面上说明你的用户有何不同。',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'docs/acme-quick-start.doc.mjs',
          code: "export default {\n  type: 'generic',\n  name: 'acme-quick-start',\n  extends: 'authoring/quick-start',\n  title: 'Acme quick start',\n  description: 'What differs when you build integrations at Acme.',\n  sections: [\n    {id: 'use-the-acme-registry', title: 'Use the Acme registry', before: 'fill-in-package-json', content: [/* ... */]},\n  ],\n};",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '你的文档仍是一个平铺话题：不要给它 `placement`。读者按路由打开指南，从不按你的 `name`。',
            '用 `replaces` 时，该路由的读者看到的是你的文档，归属于你的包。用 `extends` 时，你添加或替换的每个小节都会标注你的包。',
            '指向不存在话题或指南的名称（如某个命名空间）不会改变任何东西；`astryx doctor integration validate` 会把它列为一条提示，并附该命名空间下的各指南。',
          ],
        },
        {
          type: 'code',
          lang: 'bash',
          code: '# Every guide route, by namespace\nastryx docs authoring --depth all\nastryx docs cli --depth all\n# The keys to place sections by\nastryx docs authoring/quick-start --index',
        },
      ],
    },
    {
      id: 'check-overlaps-with-core-topics',
      title: '检查与 Core 话题的重叠',
      content: [
        {
          type: 'prose',
          text: '话题只设置 `replaces` 或 `extends` 之一，绝不两者兼设；带 placement 的指南两者都不设。话题既未声明两者却使用了 Core 话题的名称，即属意外冲突：应用仍会读到 Core 话题。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command doctor integration docs}',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'severity:     [info]\ntopic:        acme-getting-started\nrelationship: replaces\ncoreTopic:    getting-started\nmessage:      Intentional override: "acme-getting-started" replaces the Core topic "getting-started".\n\nseverity:     [fail]\ntopic:        color\nrelationship: accidental\ncoreTopic:    color\nmessage:      Accidental conflict: "color" is already a Core topic. Rename it, declare replaces: \'color\' to take it over, or declare extends: \'color\' to merge sections.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '有意的重叠以 `[info]` 打印；意外的重叠以退出码 1 失败。',
            '两者兼设的话题以 `invalid_doc` 失败；设置了任一字段的带 placement 指南同样失败。',
          ],
        },
      ],
    },
    {
      id: 'global-mode',
      title: '在全局模式下',
      content: [
        {
          type: 'prose',
          text: '在全局模式下：来自为整台电脑安装的包、且扩展或替换话题的文档，在任何项目之外的文件夹中也生效；在项目内，只有项目安装的包的这类文档生效。见 {@link namespace:global} 与 {@link generic:global-integrations}。',
        },
      ],
    },
  ],
};
