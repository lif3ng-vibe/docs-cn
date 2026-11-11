// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/component-lookups`: exact single and batch component
 * lookup through the CLI and programmatic API.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'component-lookups',
  placement: {parent: 'namespace:cli', slot: 'guides', order: 5},
  title: '组件查询',
  category: 'guide',
  keywords: ['查询', '组件查询', 'lookup', '批量'],
  description:
    '查询一个或多个精确的组件标识，选择聚焦的投影模式，并处理完整的批量回执。',
  sections: [
    {
      id: 'several',
      title: '查询多个组件',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: '`{@command component}` 接受精确选择器作为可变位置参数。不给选择器时浏览目录；给一个选择器时保持正常的单组件响应；给两个或更多时打印一份完整且有序的批量回执。',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '多个组件文档',
          code: '{@command component Button Badge Text}\nastryx --json component Button Badge Text',
        },
        {
          type: 'prose',
          text: '每个选择器按输入顺序各占一行。重复选择器保持重复的行。缺失或有歧义的组件不会隐藏成功的结果，也不会阻止后续选择器的解析。',
        },
        {
          type: 'prose',
          text: '在任何投影模式下，一次批量最多接受 100 个选择器（含重复）。更大的请求会在任何组件解析之前返回顶层 `ERR_INVALID_ARGUMENT`。它不会发出 `component.batch` 回执，也没有部分结果。',
        },
        {
          type: 'prose',
          text: '聚焦组件的控制项作用于每个找到的行。用法与单组件时相同：',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '聚焦式批量查询',
          code: 'astryx --json component Button Card --props\n{@command component Button Card --source}\n{@command component Button Card --showcase}\n{@command component Button Card --blocks}\n{@command component Button Card --detail compact}\n{@command component Button Card --lang dense}\n{@command component Button Card --package @astryxdesign/core}',
        },
      ],
    },
    {
      id: 'selectors',
      title: '选择器形式',
      category: 'reference',
      content: [
        {
          type: 'prose',
          text: '选择器是精确的组件标识，不是自由文本搜索。可用以下形式之一：',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`Button`：不带限定的组件名。',
            '`widgets/Button`：非 scoped 包中的组件。',
            '`@acme/widgets/Button`：scoped 包中的组件。',
            '`@acme/widgets@1.2.3/Button`：要求安装的正是这个包版本。',
          ],
        },
        {
          type: 'prose',
          text: '版本限定的是包，而不是组件。查询不会回退到另一个已安装的版本。不带限定且被多个已安装包拥有的名称会标记为 `ambiguous`，并列出每个候选。用带包限定的选择器或 `--package` 来选择一个。',
        },
        {
          type: 'prose',
          text: '`{@command discover}` 仍是自由文本的包发现。它的词组成一个查询，不是组件批量选择器。',
        },
      ],
    },
    {
      id: 'output',
      title: '批量输出与退出状态',
      category: 'reference',
      content: [
        {
          type: 'prose',
          text: 'JSON 使用 `component.batch`，结构为 `{count, results}`。每行回显 `selector`，并有一个状态：`found`、`not_found`、`ambiguous` 或 `error`。found 行在 `result` 下携带正常的单组件 `{type, data}`。失败行携带 `code` 和 `error`，可用时还带 `suggestions` 或 `candidates`。',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '结果与重复示例',
          code: 'astryx --json component Button Badge                 # all found, exit 0\nastryx --json component Button MissingWidget         # mixed, exit 1\nastryx --json component MissingWidget MissingPanel   # all failed, exit 1\nastryx --json component Button Button                # two ordered rows, exit 0',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '一份完整的失败 JSON 回执',
          code: 'astryx --json component MissingWidget MissingPanel',
        },
        {
          type: 'code',
          lang: 'json',
          code: '{\n  "apiVersion": 1,\n  "type": "component.batch",\n  "data": {\n    "count": 2,\n    "results": [\n      {\n        "selector": "MissingWidget",\n        "status": "not_found",\n        "code": "ERR_UNKNOWN_COMPONENT",\n        "error": "No component named \\"MissingWidget\\""\n      },\n      {\n        "selector": "MissingPanel",\n        "status": "not_found",\n        "code": "ERR_UNKNOWN_COMPONENT",\n        "error": "No component named \\"MissingPanel\\""\n      }\n    ]\n  }\n}',
        },
        {
          type: 'code',
          lang: 'text',
          label: '同一回执的文本模式',
          code: 'Component batch\n\ncount: 2\n\nResults\n\nMissingWidget\n\nselector: MissingWidget\nstatus:   not_found\ncode:     ERR_UNKNOWN_COMPONENT\nerror:    No component named "MissingWidget"\n\nMissingPanel\n\nselector: MissingPanel\nstatus:   not_found\ncode:     ERR_UNKNOWN_COMPONENT\nerror:    No component named "MissingPanel"',
        },
        {
          type: 'prose',
          text: 'CLI 先输出所有行，只要有行不是 `found` 就以退出码 1 结束。混合回执与全部失败的回执都如此。JSON 与文本使用相同的退出状态。所有行都是 `found` 的批量退出码为 0。',
        },
      ],
    },
    {
      id: 'api',
      title: '编程式 API',
      category: 'reference',
      content: [
        {
          type: 'prose',
          text: '参数形态决定响应形态。省略参数得到目录；传字符串得到原有的单组件响应；传数组得到 `component.batch`。数组一律表示批量，包括空数组和单项数组，因此对选择器列表做过滤不会悄悄改变响应类型。公开的 `ComponentBatchResponse` 是共享的 `BatchResponse` 与 `BatchRow` 类型的特化。',
        },
        {
          type: 'code',
          lang: 'javascript',
          code: "import {component} from '@astryxdesign/cli/api';\n\nconst catalog = await component(); // component.list\nconst button = await component('Button'); // component.detail\nconst empty = await component([]); // component.batch, count 0\nconst oneRow = await component(['Button']); // component.batch, count 1\nconst batch = await component(['Button', 'Badge']); // component.batch, count 2\nawait component(Array(101).fill('Button')); // ERR_INVALID_ARGUMENT before lookup",
        },
        {
          type: 'code',
          lang: 'json',
          label: '空数组的精确响应',
          code: '{\n  "type": "component.batch",\n  "data": {\n    "count": 0,\n    "results": []\n  }\n}',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: '处理每一行而不丢失部分结果',
          code: "const receipt = await component(['Button', 'MissingWidget']);\n\nfor (const row of receipt.data.results) {\n  if (row.status === 'found') {\n    useComponentDoc(row.selector, row.result);\n  } else if (row.status === 'ambiguous') {\n    choosePackage(row.selector, row.candidates);\n  } else {\n    reportLookupFailure(row.selector, row.code, row.error);\n  }\n}",
        },
      ],
    },
  ],
};
