// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'LinkProvider',
  displayName: 'Link Provider',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: ['link', 'provider', 'router', 'nextjs', 'client-side-routing', '链接', '路由', '客户端路由'],
  usage: {
    description: '包裹你的应用，将默认 <a> 标签替换为框架专属的链接组件（例如 Next.js Link），为所有 Astryx 组件提供客户端路由。',
  },
  props: [
    {name: 'component', type: 'LinkComponentType', required: true, description: '用于子树中所有链接元素的链接组件（例如 Next.js Link）。它在 Link `href` prop 所述的共享导航规则下接收通过校验的 `href` 与 `to` 值。支持的结构化目标（包括其 `protocol`）会在不改变对象同一性的前提下接受校验。任一提供的目标被拒绝时，Astryx 渲染惰性内容而不调用该组件；不会传入 undefined，也不会回退到另一个目标。'},
    {name: 'children', type: 'ReactNode', required: true, description: '与链接 provider 一起渲染的内容。'},
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '包裹应用，将默认 <a> 标签替换为框架专属的链接组件（例如 Next.js Link），为所有 Astryx 组件提供客户端路由。',
  usage: {
    description: '包裹应用，将默认 <a> 标签替换为框架专属的链接组件（例如 Next.js Link），为所有 Astryx 组件提供客户端路由。',
  },
  propDescriptions: {
    component: '用于子树中所有链接元素的链接组件（例如 Next.js Link）。通过的 href/to 遵循 Link href 规则；校验结构化字段（含 protocol），并保持对象同一性。任一被拒绝 => 惰性内容，不调用路由器，无回退。',
  },
};
