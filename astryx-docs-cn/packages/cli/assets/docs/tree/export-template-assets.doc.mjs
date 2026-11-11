// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/build-the-template/package-and-test/export-template-assets`:
 * expose and include everything a copied template imports, and declare the
 * packages it needs.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'export-template-assets',
  placement: {
    parent: 'namespace:package-and-test',
    slot: 'guides',
    order: 10,
  },
  title: '导出模板与资产',
  category: 'guide',
  description:
    '确保发布的包包含并暴露复制模板所导入的一切。',
  sections: [
    {
      id: 'keep-the-generated-template-export',
      title: '保留生成的模板导出',
      content: [
        {
          type: 'prose',
          text: '`integration verify` 通过不带扩展名的公开包路径解析每个模板，如 `./templates/acme-dashboard`，路径缺失时即失败。',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'package.json',
          code: `{
  "exports": {
    "./templates/acme-dashboard": "./templates/acme-dashboard.tsx"
  }
}`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '当 `package.json` 已有 `exports` 映射时，`integration add` 会写入这条条目（{@link generic:start-a-template}）。没有映射时它什么都不写，因为新建映射会把既有的深层导入变成私有的。请自行添加映射，再添加这条条目。',
            '公开路径不带 `.tsx`，只有目标文件以 `.tsx` 结尾。',
            '不要把条目指向会丢失模板默认导出的桶文件（barrel file）。',
          ],
        },
      ],
    },
    {
      id: 'export-package-owned-support-files',
      title: '导出包自带的支持文件',
      content: [
        {
          type: 'prose',
          text: '为复制源码导入的每个包自带的组件、辅助函数、图标或样式表添加公开路径。仅用于实现的文件保持私有。',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'package.json 相关条目',
          code: `{
  "exports": {
    "./templates/acme-dashboard": "./templates/acme-dashboard.tsx",
    "./components/AcmeStatusCard": "./components/AcmeStatusCard.tsx",
    "./icons/AcmePulseIcon": "./icons/AcmePulseIcon.tsx",
    "./styles/acme-dashboard.css": "./styles/acme-dashboard.css"
  }
}`,
        },
        {
          type: 'prose',
          text: '如果某个区块还会作为实时 `.tsx` 预览被直接加载，请添加一个保留扩展名的模式，如 `"./templates/*.tsx": "./templates/*.tsx"`。同时保留生成的条目；`integration verify` 正是通过它解析模板。',
        },
      ],
    },
    {
      id: 'include-every-file',
      title: '包含每一个文件',
      content: [
        {
          type: 'prose',
          text: '导出可能指向一个被 npm 排除在外的文件。当 `package.json#files` 存在时，请列出集成清单、模板目录，以及复制文件依赖的每个目录。',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'package.json',
          code: `{
  "files": [
    "astryx.integration.mjs",
    "templates",
    "components",
    "icons",
    "styles",
    "assets/fonts"
  ],
  "sideEffects": ["**/*.css"]
}`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '当 `files` 列表已存在时，`integration add` 会追加清单与模板目录。其余目录请自行添加。',
            '如果 `package.json` 设置了 `sideEffects`，请像上面那样把 CSS 包含进去，让打包器保留带副作用的样式表导入。',
            '运行 `{@pm-only npm "registry 收到的压缩包" pack --dry-run}`，读取真实的文件列表，而不是凭工作区推测。',
          ],
        },
      ],
    },
    {
      id: 'declare-what-the-copied-file-imports',
      title: '声明复制文件导入的内容',
      content: [
        {
          type: 'prose',
          text: '复制文件从应用中导入，因此应用必须安装它导入的每一个包。Astryx peer 依赖按 {@link generic:versioning} 所述声明。其他包则按下表：',
        },
        {
          type: 'table',
          headers: ['字段', '用途'],
          rows: [
            [
              '`peerDependencies`',
              '复制源码导入的库，如某个图标库。同时把它们列入 `devDependencies`，让包自身也能构建。',
            ],
            [
              '`dependencies`',
              '仅由包自带模块使用的运行时包，应随集成一同分发',
            ],
            [
              '`devDependencies`',
              '构建与测试集成本身所需的一切',
            ],
          ],
        },
        {
          type: 'prose',
          text: '只使用你测试过的版本范围。仅因工作区提升（hoist）才得以解析的包，视为未声明。',
        },
      ],
    },
  ],
};
