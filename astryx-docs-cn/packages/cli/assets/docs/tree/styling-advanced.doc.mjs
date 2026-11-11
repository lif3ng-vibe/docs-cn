// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling/styling-advanced`: compound component styling,
 * data-attribute selectors, deprecated bare classes, and what not to do.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'styling-advanced',
  title: '进阶',
  placement: {parent: 'namespace:styling', slot: 'guides', order: 20},
  category: 'guide',
  description:
    '复合组件样式、data 属性选择器、迁移已移除的主题兼容选择器，以及常见反模式。',
  keywords: [
    '复合组件',
    'data 属性',
    '已移除的类',
    '选择器',
    'astryx-button',
    'data-variant',
  ],

  sections: [
    {
      title: '复合组件',
      content: [
        {
          type: 'prose',
          text: '复杂组件由更小的组件组合而成。每个子组件都接受自己的 xstyle、className 以及其余 props。你要对各个部分分别设置样式；不存在一个能"深入子部件"的 prop。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '各部分分别设置样式的 Dialog',
          code: `import * as stylex from '@stylexjs/stylex';

const overrides = stylex.create({
  dialog: { maxWidth: 500 },
  content: { gap: 'var(--spacing-4)' },
});

<Dialog isOpen={isOpen} onOpenChange={close} xstyle={overrides.dialog}>
  <Layout
    header={
      <LayoutHeader hasDivider>
        <Heading level={2}>Edit Profile</Heading>
      </LayoutHeader>
    }
    content={
      <LayoutContent xstyle={overrides.content}>
        <TextInput label="Name" value={name} onChange={setName} />
      </LayoutContent>
    }
    footer={
      <LayoutFooter hasDivider>
        <Button label="Cancel" variant="secondary" onClick={close} />
        <Button label="Save" variant="primary" onClick={save} />
      </LayoutFooter>
    }
  />
</Dialog>`,
        },
        {
          type: 'prose',
          text: '模式是：父组件（Dialog）掌管结构与行为，子组件（Layout、Header、Button）掌管各自的外观。在每一块所在之处为它设置样式。',
        },
      ],
    },
    {
      id: 'preferred-selector-surface-data-attributes',
      title: 'data 属性选择器',
      content: [
        {
          type: 'prose',
          text: '当外部 CSS 需要按 prop 或状态选中某个 Astryx 组件时，把稳定的组件类名与透传（reflected）的 data 属性组合使用。组件类名标识组件（`.astryx-button`、`.astryx-card`）；data 属性标识维度与取值（`data-variant`、`data-size`、`data-level` 等）。对新的 CSS 而言，这是首选的选择器接面，因为它显式且抗冲突。',
        },
        {
          type: 'code',
          lang: 'css',
          code: `.my-app .astryx-button[data-variant="primary"] {
  /* primary buttons in this app context */
}

.my-app .astryx-button[data-variant="primary"][data-size="sm"] {
  /* small primary buttons */
}

.my-app .astryx-heading[data-level="2"] {
  /* level 2 headings; numeric values stay literal in data attrs */
}`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '组件会透传哪些属性',
          code: `// <Button variant="primary" size="sm" />
// preferred selector attrs: data-variant="primary" data-size="sm"

// <Card variant="elevated" />
// preferred selector attrs: data-variant="elevated"

// <Heading level={2} />
// preferred selector attrs: data-level="2"`,
        },
        {
          type: 'prose',
          text: '要做系统化的主题定制，请使用 defineTheme 的组件覆盖（component overrides），而不是裸 CSS 选择器。defineTheme 保留了更高层的 `prop:value` API（`variant:primary`、`size:sm`），并替你生成选择器。组件主题定制请运行 {@link generic:author-a-theme}。',
        },
      ],
    },
    {
      id: 'deprecated-classes',
      title: '迁移已移除的主题兼容选择器',
      content: [
        {
          type: 'prose',
          text: 'Astryx 0.7 只输出规范的 `astryx-*` 目标类与透传的 `data-*` 属性。运行 `{@command upgrade --from <your 0.6 version> --apply --path .}` 来重命名主题 `components` 映射中已移除的目标键，并迁移 CSS 选择器。CSS 迁移会重命名已移除的目标类，并把目标限定的裸 prop/value/state 类（如 `.primary`、`.sm`、`.level-2`、`.checked`）替换为对应的 `data-*` 选择器。',
        },
        {
          type: 'code',
          lang: 'css',
          code: `/* Before */
.astryx-progressbar.success > .astryx-progressbar-mark.fill {}
.astryx-selector-clear-icon { color: red; }

/* After */
.astryx-progress-bar:is([data-variant="success"]) >
  .astryx-progress-bar-mark:is([data-placement="fill"]) {}
.astryx-input-clear-icon:where(.astryx-selector *) { color: red; }`,
        },
        {
          type: 'prose',
          text: '已移除目标的映射：`base-table` → `table`; `checkbox` → `checkbox-indicator`; `codeblock` → `code-block`; `codeblock-copy-button` → `code-block-copy-button`; `codeblock-header` → `code-block-header`; `codeblock-title` → `code-block-title`; `date-input-clear-icon`, `date-range-input-clear-icon`, `multi-selector-clear-icon`, and `selector-clear-icon` → `input-clear-icon`; `hovercard` → `hover-card`; `navicon` → `nav-icon`; `popover-surface` → `popover`; `progressbar`, `progressbar-fill`, `progressbar-mark`, and `progressbar-track` → their hyphenated `progress-bar*` forms; `radio` → `radio-indicator`; `radio-dot` → `radio-indicator-dot`; `statusdot` → `status-dot`; `textarea` → `text-area`.',
        },
        {
          type: 'prose',
          text: '`input-clear-icon` 为各种输入组件的清除图标设置样式。在 CSS 中，升级工具用 `:where(.astryx-<component> *)` 把每条旧的 clear-icon 规则限定在各自组件上。主题键无法携带这种限定范围，因此升级工具会重命名该键，并添加一条 `TODO(astryx upgrade)` 注明应改用的 CSS 选择器。',
        },
        {
          type: 'prose',
          text: '当 `components` 映射属于从 Astryx 导入的 `defineTheme()` 调用、类型为 Astryx 主题的对象，或同名主题描述文件（`<stem>.doc.mjs`）所声明的主题对象——即以 `<stem>` 导出的顶层绑定，含静态 `name` 且组件条目均为样式对象——时，升级工具才把它当作主题。其他任何形似的对象（比如同一文件里来自其他库的主题对象）都不是 Astryx 主题。计算得出的主题键、未限定类、未知的消费方类、声明、注释，以及 JavaScript 或 TypeScript 字符串里的 CSS，一律保持不动。当映射同时含有旧键与规范键，或某个 Astryx 曾输出过的裸类在目标上找不到已知含义时，会添加 `TODO(astryx upgrade)`。每个 TODO 都请人工复核。',
        },
      ],
    },
    {
      title: '不该做的事',
      content: [
        {
          type: 'list',
          style: 'dont',
          items: [
            '在裸 <div> 包裹层上写 style={{}}。请直接在组件上使用 xstyle。',
            '硬编码颜色（#fff、rgb(...)）。请使用 var(--color-*) 令牌或 Tailwind 语义类（text-primary、bg-surface）。',
            '硬编码间距（16px、1rem）。请使用 var(--spacing-*) 令牌或 Tailwind 间距工具类（p-4、gap-3）。',
            '只是为了加个外边距就用 <div> 包一层组件。请在组件上用 xstyle 配合 stylex.create。',
            '使用 !important。如果样式没有生效，先检查选择器优先级；xstyle 最后合并。',
          ],
        },
      ],
    },
  ],
};
