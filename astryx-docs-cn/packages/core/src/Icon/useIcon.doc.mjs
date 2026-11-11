// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useIcon',
  displayName: 'useIcon',
  group: 'Icon',
  keywords: [
    'icon',
    '图标',
    'semantic icon',
    '语义图标',
    'theme icons',
    'icon registry',
    'getIcon',
    'registerIcons',
    'success',
    'warning',
    'error',
  ],
  params: [
    {
      name: 'name',
      type: 'IconName | NamespacedIconName',
      description:
        "语义图标名称，如 'success'、'warning' 或 'close'，或带命名空间的扩展键，如 'richtext:bold'。两者都通过同一个注册表解析。",
      required: true,
    },
  ],
  returns: [
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        "该名称对应的图标：取自最近 Theme 的 icons（不在任何 Theme 内时，取文档根指定的已注册主题），否则取 registerIcons() 的覆盖，再否则取内建默认值。函数条目按 {size: 'md'} 读取。",
    },
  ],
  usage: {
    description:
      "通过最近的 Theme 把语义图标名称解析为 React 节点，让自定义组件画出与 Astryx 组件相同的 success、warning 或 error 图标，并跟随覆盖了该图标的主题。解析顺序：最近 Theme 的 icons（不在任何 Theme 内时，取文档根指定的已注册主题），然后是 registerIcons() 覆盖，最后是内建默认值。节点原样返回，没有尺寸或颜色包装：内建图标是 currentColor 的 1em 方块，会跟随周围文字。函数条目按 {size: 'md'} 读取。当图标需要其他尺寸、颜色或标签时，请改用 <Icon icon={name} />。",
    bestPractices: [
      {
        guidance: true,
        description:
          '在自行放置语义图标的自定义组件中使用它，这样覆盖图标的 Theme 也会改变该组件。',
      },
      {
        guidance: true,
        description:
          '当图标需要 md 以外的尺寸、颜色或无障碍标签时，渲染 <Icon icon={name} />。',
      },
      {
        guidance: false,
        description:
          '不要为应由主题控制的语义用途（如 success 或 error 状态）导入特定图标库的字形。',
      },
    ],
  },
  relatedComponents: ['Icon', 'Theme'],
  relatedHooks: ['useTheme'],
  importPath: '@astryxdesign/core/Icon',
  category: 'utilities',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    "通过最近的 Theme 将语义图标名称解析为 React 节点，自定义组件与 Astryx 组件画出同样的图标并跟随主题覆盖。回退顺序：最近 Theme 的 icons（不在任何 Theme 内时取根的已注册主题）、registerIcons() 覆盖、内建默认。节点原样返回（内建图标为 1em、currentColor）。函数条目按 {size: 'md'} 读取。需要其他尺寸、颜色或标签时用 <Icon icon={name} />。",
  paramDescriptions: {
    name: "语义图标名称（'success'、'close'）或命名空间键（'richtext:bold'）；同一注册表。",
  },
  returnDescriptions: {
    icon: "来自最近 Theme 的图标节点（不在任何 Theme 内时取根的已注册主题），否则 registerIcons() 覆盖，再否则内建默认；函数条目按 {size: 'md'} 读取。",
  },
  usage: {
    description:
      "通过最近的 Theme 将语义图标名称解析为 React 节点；自定义组件跟随主题图标覆盖。回退：最近 Theme（或根的已注册主题）、registerIcons()、内建。无尺寸/颜色包装；函数条目按 {size: 'md'} 读取。其他尺寸、颜色或标签用 <Icon icon={name} />。",
    bestPractices: [
      {
        guidance: true,
        description:
          '在自行放置语义图标的自定义组件中使用，Theme 覆盖即可惠及它们。',
      },
      {
        guidance: true,
        description:
          '需要非 md 尺寸、颜色或无障碍标签时，渲染 <Icon icon={name} />。',
      },
      {
        guidance: false,
        description:
          '不要为应由主题控制的语义用途（success、error）导入库字形。',
      },
    ],
  },
};
