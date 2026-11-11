// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'MetadataList',
  displayName: 'Metadata List',
  group: 'MetadataList',
  category: 'Table & List',
  keywords: ["metadata","description","definition","keyvalue","元数据","键值对","属性","详情","摘要","descriptions"],
  theming: {
    targets: [
      {
        className: 'astryx-metadata-list',
        visualProps: ['columns', 'orientation'],
      },
      {className: 'astryx-metadata-list-item'},
    ],
  },
  description: '元数据项的容器，支持列布局、方向与折叠。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '元数据项（MetadataListItem 组件）。',
      slotElements: [
        {
          __element: 'MetadataListItem',
          props: {
            label: 'Key',
          },
          children: 'Value',
        },
      ],
      required: true,
    },
    {
      name: 'columns',
      type: "'multi' | 'single' | number",
      description: '列布局模式。',
      default: "'single'",
    },
    {
      name: 'label',
      type: "{ position?: 'start' | 'top', width?: number | string }",
      description: "标签显示配置。position 控制标签位置，width 设置自定义标签列宽。多列布局默认 { position: 'top' }。水平模式忽略 position，始终使用 { position: 'top' }。",
      default: "{ position: 'start' } (vertical single-column) / { position: 'top' } (multi-column or horizontal)",
    },
    {
      name: 'maxNumOfItems',
      type: 'number',
      description: '折叠前显示的最大项数，超过后出现“显示更多/更少”开关。',
    },
    {
      name: 'orientation',
      type: "'vertical' | 'horizontal'",
      description: '布局方向。水平模式用 flex-wrap 把项排成一行。',
      default: "'vertical'",
    },
    {
      name: 'title',
      type: 'ReactNode',
      description: '列表上方的可选标题。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局定制的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
  components: [
    {name: 'MetadataListItem'},
  ],
  usage: {
    description:
      'MetadataList 以结构化布局显示对象属性（如品质、成色、状态）的键值对。用于详情面板、设置摘要与记录信息。',
    bestPractices: [
      { guidance: true, description: '根据内容选择标签位置：短值用 "start"，长而复杂的值用 "top"。' },
      { guidance: true, description: '用 `maxNumOfItems` 折叠长列表，保持页面易于浏览。' },
      { guidance: false, description: '不要用于大量表单输入；请改用表单布局。' },
      { guidance: false, description: '不要用于没有清晰键值结构的数据。' },
    ],
    anatomy: [
      {name: 'Title', required: false, description: '元数据列表的可选标题。'},
      {name: 'Label', required: true, description: '每个元数据条目的键标签。'},
      {name: 'Metadata', required: true, description: '以各种格式显示的值。'},
      {name: 'Disclosure', required: false, description: '列表的折叠/展开控件。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'MetadataList displays key-value pairs for object attributes like quality, condition, and status, in a structured layout. Use it for detail panels, settings summaries, and record information.',
    bestPractices: [
      { guidance: true, description: 'Choose label position based on content: "start" for short values, "top" for long or complex values.' },
      { guidance: true, description: 'Collapse long lists with `maxNumOfItems` to keep the page scannable.' },
      { guidance: false, description: 'Use for extensive form input; use a form layout instead.' },
      { guidance: false, description: "Use for data that doesn't have a clear key-value structure." },
    ],
    anatomy: [
      {name: 'Title', required: false, description: 'Optional title for the metadata list.'},
      {name: 'Label', required: true, description: 'The key label for each metadata entry.'},
      {name: 'Metadata', required: true, description: 'The value displayed in various formats.'},
      {name: 'Disclosure', required: false, description: 'Collapse/expand control for the list.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: 'label/value 元数据展示；支持列布局、折叠与方向变体',
  usage: {
    description:
      'MetadataList 以结构化布局显示对象属性（如品质、成色、状态）的键值对。用于详情面板、设置摘要与记录信息。',
    bestPractices: [
      { guidance: true, description: '根据内容选择标签位置：短值用 "start"，长而复杂的值用 "top"。' },
      { guidance: true, description: '用 `maxNumOfItems` 折叠长列表，保持页面易于浏览。' },
      { guidance: false, description: '不要用于大量表单输入；请改用表单布局。' },
      { guidance: false, description: '不要用于没有清晰键值结构的数据。' },
    ],
    anatomy: [
      {name: 'Title', required: false, description: '元数据列表的可选标题。'},
      {name: 'Label', required: true, description: '每个元数据条目的键标签。'},
      {name: 'Metadata', required: true, description: '以各种格式显示的值。'},
      {name: 'Disclosure', required: false, description: '列表的折叠/展开控件。'},
    ],
  },
};
