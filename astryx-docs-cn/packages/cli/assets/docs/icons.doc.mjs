// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Icons reference doc: semantic icon names available in Astryx
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  name: 'icons',
  title: '图标',
  category: 'foundations',
  description:
    "设计系统中可用的语义图标名。它们会适配当前激活主题的图标注册表。",

  sections: [
    {
      title: '可用名称',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '接受 icon prop 的组件使用 IconType：既可以是语义名称字符串，也可以是直接的 SVG 组件。下面的语义名称通过全局图标注册表解析。',
        },
        {
          type: 'table',
          headers: ['名称', '用途'],
          rows: [
            ['close', '关闭、关闭对话框/面板'],
            ['chevronDown', '下拉触发器、展开/收起'],
            ['chevronLeft', '向后导航、上一项'],
            ['chevronRight', '向前导航、下一项'],
            ['chevronsLeft', '跳到第一项、回到开头'],
            ['chevronsRight', '跳到最后一项、跳到结尾'],
            ['check', '复选框勾选、确认'],
            ['success', '成功状态指示'],
            ['error', '错误状态指示'],
            ['warning', '警告状态指示'],
            ['info', '信息状态指示、工具提示'],
            ['calendar', '日期选择器、日程安排'],
            ['clock', '时间选择器、时间戳'],
            ['externalLink', '在新标签页打开的链接'],
            ['menu', '汉堡菜单、导航开关'],
            ['moreHorizontal', '溢出菜单、更多操作'],
            ['search', '搜索输入、查找'],
            ['upload', '上传文件或内容'],
            ['arrowUp', '升序排序、上移'],
            ['arrowDown', '降序排序、下移'],
            ['arrowsUpDown', '可排序列指示器'],
            ['funnel', '筛选控件'],
            ['eyeSlash', '隐藏/可见性开关'],
            ['viewColumns', '列可见性设置'],
            ['copy', '复制到剪贴板'],
            ['checkDouble', '已复制确认'],
            ['wrench', '设置、配置'],
            ['stop', '停止/取消操作'],
            ['microphone', '语音输入、录音'],
          ],
        },
      ],
    },
    {
      title: '自定义图标',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '对于语义列表之外的图标，直接传入 SVG 组件。任何 ComponentType<SVGProps<SVGSVGElement>> 都可以；Icon 会自动应用尺寸与颜色样式。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '使用自定义 SVG 组件',
          code: `import { PhotoIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from 'lucide-react';

<Icon icon={PhotoIcon} size="lg" />
<Icon icon={HeartIcon} color="error" />`,
        },
      ],
    },
    {
      title: '主题覆盖',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '主题可以通过 `defineTheme()` 的 `icons` 字段，为任意语义名称替换默认 SVG。这样无需改动组件代码就能整套换图标（例如 heroicons → lucide），且查找只作用于当前激活的主题，不会改动全局默认值。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '主题作用域图标',
          code: `import {defineTheme} from '@astryxdesign/core/theme';
import {XMarkIcon, ChevronDownIcon} from '@heroicons/react/24/outline';

export const brandTheme = defineTheme({
  name: 'brand',
  icons: {
    close: <XMarkIcon />,
    chevronDown: <ChevronDownIcon />,
  },
});`,
        },
        {
          type: 'prose',
          text: "条目也可以是请求的函数，这样主题就能把 Icon 的尺寸映射为图标库自身的 props 或图形。`Icon` 以 `{size, variant}` 调用它，其中 `size` 是它渲染时所处的尺寸（`xsm`、`sm`、`md` 或 `lg`：显式 `size` 优先，其次所属组件的默认值，否则为 `md`）。返回单个节点的读取——`getIcon()`、`useIcon()`、`getIconRegistry()` 与主题的 `icons` 字段——以 `{size: 'md'}` 调用它。同样的条目形态也适用于 `registerIcons()`。",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '感知尺寸的图标条目',
          code: `import {defineTheme} from '@astryxdesign/core/theme';
import {Info} from 'lucide-react';

export const brandTheme = defineTheme({
  name: 'brand',
  icons: {
    // A heavier stroke keeps the small size legible.
    info: ({size}) => <Info strokeWidth={size === 'sm' || size === 'xsm' ? 2.5 : 2} />,
  },
});`,
        },
        {
          type: 'prose',
          text: '保持该函数纯且同步：只依据请求计算结果，不用 hooks、不做 DOM 或 SVG 测量、不碰浏览器全局、不访问网络、不改可变模块状态、没有副作用。它的结果就是最终结果。返回 `null` 表示不绘制任何字形，而不是回退到已注册或内置图标；值为 `null` 或 `undefined` 的节点条目仍会回退。为某个键设置条目的子主题，会替换该键继承来的条目。',
        },
      ],
    },
    {
      title: '图标变体',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: "主题用 `defineTheme()` 的 `iconVariants` 一次性列出它支持的图标变体名。该列表属于整个主题，从不属于单个图标，Astryx 自身不定义任何名称。在 `defineTheme` 内部，条目函数收到的 `variant` 会被类型化为列出的名称或 `undefined`，因此拼错的名称会得到类型错误。收到 `undefined` 的条目绘制其常规图形。",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '列出变体并映射到图形',
          code: `import {defineTheme} from '@astryxdesign/core/theme';
import {InfoFilledIcon, InfoIcon} from './brand-icons';

export const brandTheme = defineTheme({
  name: 'brand',
  iconVariants: ['outline', 'filled'],
  icons: {
    info: ({size, variant}) =>
      variant === 'filled' ? <InfoFilledIcon /> : <InfoIcon bold={size === 'sm'} />,
  },
});

brandTheme.iconVariants; // ['outline', 'filled']`,
        },
        {
          type: 'prose',
          text: '`extends` 另一主题的主题会继承其列表，除非它自己设置；自己设置的列表会整体替换继承的列表，而不是与其合并。',
        },
        {
          type: 'prose',
          text: "用 `Icon` 的 `variant` prop 请求变体。只有当激活主题列出了该变体，条目才会收到它；主题继承来的条目，还需要定义它的那个主题也列出它。否则条目收到 `undefined` 并绘制常规图形，因此未列出的变体绝不会破坏渲染。`registerIcons()` 的条目收到激活主题列出的变体，而节点条目对每个变体绘制同一节点。直接传给 `Icon` 的图标组件永远不会收到 `variant`，`variant` 也从不写入 DOM：它只挑选图形，因此没有对应的主题化选择器。",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '请求变体',
          code: `<Icon icon="info" variant="filled" />  // brandTheme: the filled artwork
<Icon icon="info" />                    // the normal artwork`,
        },
        {
          type: 'prose',
          text: '应用通过增强 `@astryxdesign/core/Icon` 的 `IconVariantMap` 来声明自己使用的变体名。`IconVariant` 即这些名称，传给 `registerIcons()` 的条目收到的 `variant` 会类型化为 `IconVariant`。`astryx theme build` 会为构建主题的列表写出这份增强。',
        },
        {
          type: 'code',
          lang: 'ts',
          label: '声明应用使用的变体名',
          code: `declare module '@astryxdesign/core/Icon' {
  interface IconVariantMap {
    outline: true;
    filled: true;
  }
}`,
        },
      ],
    },
    {
      title: '组件与库图标',
      category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '属于单个组件或库的字形使用带命名空间的键（`numberInput:stepperDown`、`richtext:bold`），而不是新增语义名称。它经由同一注册表解析，主题也以同样方式覆盖它；但共享的 IconName 列表仍保留给整个系统使用的字形，这样新增一个键不会让每个下游图标注册表都跟着长出一个键。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '持有并主题化命名空间图标',
          code: `// The component renders it like any other name, keeping size and color.
<Icon icon="numberInput:stepperDown" size="xsm" />

// A theme maps it independently of the shared chevron.
export const brandTheme = defineTheme({
  name: 'brand',
  icons: {
    chevronDown: <ChevronDownIcon />,
    'numberInput:stepperDown': <CaretDownFilledIcon />,
  },
});`,
        },
        {
          type: 'prose',
          text: '在 core 之外，给 `getExtendedIcon(key, fallback)` 传一个回退，让字形在无主题时也能渲染。',
        },
      ],
    },
    {
      title: '组件图标插槽',
      category: 'foundations',
      content: [
        {
          type: 'prose',
          text: "组件图标插槽说明图标为何出现在某个组件中，例如 CodeBlock 复制按钮的 `code-block-copy`。`defineTheme({componentIcons})` 把插槽映射到共享图标名之一。主题由此可以只改某个组件用的图标，而不改动该名称在别处的图形；`icons` 仍然决定每个名称的图形。各组件的文档列出其插槽、状态与回退（`astryx component CodeBlock`）。",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '映射插槽（含其状态）',
          code: `export const brandTheme = defineTheme({
  name: 'brand',
  componentIcons: {
    'code-block-copy': ({copied}) => ({icon: copied ? 'checkDouble' : 'copy'}),
  },
});`,
        },
        {
          type: 'prose',
          text: "插槽取值可以是共享图标名、隐藏图标的 `null`，或由 `icon`、`variant` 与 `size` 组成的部分请求。请求省略的字段沿用组件自身的取值。带状态的插槽还接受一个以该状态为输入、返回请求的纯同步函数：返回 `null` 隐藏图标，返回 `undefined` 则不做任何改变。请求中的 `size` 只改变图标本身，绝不改变它周围的控件。组件调用方传入的图标内容优先于插槽。",
        },
        {
          type: 'prose',
          text: "未知的图标名、主题未列出的变体，或 `xsm`、`sm`、`md`、`lg` 之外的尺寸，会在该字段被忽略，并在开发模式给出一次警告。扩展另一主题的主题按插槽合并 `componentIcons`（{@link generic:author-a-theme}）。`theme.componentIcons` 读回名称、`null` 值与静态请求，不含由函数解析的插槽。",
        },
      ],
    },
  ],
};
