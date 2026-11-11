// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatComposerTokenElement',
  subComponentOf: 'Chat',
  displayName: 'Chat Composer Token Element',
  isHiddenFromOverview: true,
  description: '在 contentEditable 输入外渲染单个标记芯片。把徽章配置或自定义渲染函数包进正确的 data-astryx-token span，让标记正确序列化，并与编写器内的标记保持视觉一致。',
  playground: {
    defaults: {
      token: {value: '@astryx', label: '@astryx', variant: 'blue'},
    },
  },
  props: [
    {
      name: 'token',
      type: 'ChatComposerToken',
      description: '要渲染的标记。常见场景传徽章配置（{ value, label, variant?, icon? }），需要完全控制时传自定义渲染（{ value, render }）。',
      required: true,
    },
  ],
};

export const docsZh = {
  name: 'ChatComposerTokenElement',
  isHiddenFromOverview: true,
  displayName: 'Chat Composer Token Element',
  description: '在 contentEditable 外部渲染标记芯片。',
  propDescriptions: {
    token: '徽章配置或自定义渲染。',
  },
};

export const docsDense = {
  name: 'ChatComposerTokenElement',
  isHiddenFromOverview: true,
  displayName: 'Chat Composer Token Element',
  description: 'contentEditable 外的标记芯片；徽章配置或自定义渲染包在 data-astryx-token span 内',
  propDescriptions: {
    token: '徽章配置或自定义渲染',
  },
};
