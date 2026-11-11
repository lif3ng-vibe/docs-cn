// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'MetadataListItem',
  subComponentOf: 'MetadataList',
  displayName: 'Metadata List Item',
  isHiddenFromOverview: true,
  description: 'MetadataList 中的单个带标签元数据值。',
  playground: {
    defaults: {label: '状态', children: '活跃'},
    wrapper: {component: 'MetadataList'},
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '此元数据项的内容值。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '此元数据项的标签文本。',
      required: true,
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '标签文本前渲染的图标。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
  ],
};

export const docsZh = {
  name: 'MetadataListItem',
  isHiddenFromOverview: true,
  displayName: 'Metadata List Item',
  description: 'MetadataList 中的单个带标签元数据值。',
  propDescriptions: {
    children: '此元数据项的内容值。',
    label: '此元数据项的标签文本。',
    icon: '标签文本前渲染的图标。',
  },
};

export const docsDense = {
  name: 'MetadataListItem',
  isHiddenFromOverview: true,
  displayName: 'Metadata List Item',
  description: 'MetadataList 中的单个带标签值',
  propDescriptions: {
    children: '值内容',
    label: '标签文本',
    icon: '标签前的图标',
  },
};
