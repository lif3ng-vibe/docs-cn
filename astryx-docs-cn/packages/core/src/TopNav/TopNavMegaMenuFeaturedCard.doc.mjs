// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TopNavMegaMenuFeaturedCard',
  subComponentOf: 'TopNav',
  displayName: 'Top Nav Mega Menu Featured Card',
  description: 'TopNavMegaMenu featured 插槽的标准精选卡片。提供带可选图片、标题、描述与 CTA 链接的一致卡片。',
  props: [
    {
      name: 'title',
      type: 'string',
      description: '卡片标题。',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: '标题下方的描述文本。',
    },
    {
      name: 'image',
      type: 'string',
      description: '显示在正文上方的可选图片 URL。',
    },
    {
      name: 'imageAlt',
      type: 'string',
      description: '图片的替代文本。省略时图片被显式标记为装饰性 (alt=""、role="presentation"、aria-hidden)——卡片已有可见标题，这通常是正确的。仅当图片传达标题与描述之外的信息时才提供。',
    },
    {
      name: 'linkLabel',
      type: 'string',
      description: 'CTA 链接文本。',
    },
    {
      name: 'linkHref',
      type: 'string',
      description: 'CTA 链接 URL。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '渲染在标准正文下方的自定义内容。',
    },
  ],
};

export const docsZh = {
  name: 'TopNavMegaMenuFeaturedCard',
  displayName: 'Top Nav Mega Menu Featured Card',
  description: '超级菜单 featured 插槽的标准特色卡片。提供带可选图片、标题、描述和 CTA 链接的一致卡片。',
  props: [
    {
      name: 'title',
      type: 'string',
      description: '卡片标题。',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: '标题下方的描述文本。',
    },
    {
      name: 'image',
      type: 'string',
      description: '正文上方显示的可选图片 URL。',
    },
    {
      name: 'imageAlt',
      type: 'string',
      description: '图片的替代文本。省略时图片会被显式标记为装饰性（alt=""、role="presentation"、aria-hidden）——由于卡片已有可见标题，这通常是正确的。仅当图片传达标题和描述之外的信息时才提供。',
    },
    {
      name: 'linkLabel',
      type: 'string',
      description: 'CTA 链接文本。',
    },
    {
      name: 'linkHref',
      type: 'string',
      description: 'CTA 链接 URL。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '标准正文下方渲染的自定义内容。',
    },
  ],
};

export const docsDense = {
  name: 'TopNavMegaMenuFeaturedCard',
  displayName: 'Top Nav Mega Menu Featured Card',
  description: '超级菜单 featured 插槽的标准精选卡片。可选图片、标题、描述、CTA 链接。',
  propDescriptions: {
    title: '卡片标题。',
    description: '标题下方的描述。',
    image: '正文上方的图片 URL。',
    imageAlt: '图片替代文本。省略 → 显式装饰性 (对屏幕阅读器隐藏)；卡片已有可见标题，通常正确。',
    linkLabel: 'CTA 链接文本。',
    linkHref: 'CTA 链接 URL。',
    children: '标准正文下方的自定义内容。',
  },
};
