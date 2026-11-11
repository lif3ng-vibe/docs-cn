// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableRowIndex',
  subComponentOf: 'Table',
  displayName: 'useTableRowIndex',
  description:
    '返回 TablePlugin 的 Hook，前置一个右对齐、等宽字体的行号列，默认从 1 开始。不传 data 时，行号跟随 Table 提供的行位置；传入 data 时，普通行号跟随该数组的顺序。虚拟窗口化的行直接使用父 Table 的逻辑位置；非默认 startFrom 值则使用完整渲染。',
  props: [
    {
      name: 'data',
      type: 'T[]',
      description:
        '可选：行号要跟随其顺序的数组。省略时按 Table 给行的位置编号。',
    },
    {
      name: 'getRowKey',
      type: '(item: T) => string',
      description:
        '可选的 key 提取器，与 data 搭配使用，为每行返回唯一字符串。提供时，行按返回的字符串与 data 匹配；否则按引用同一性匹配。请用 useCallback 记忆化以保持插件标识稳定。',
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: '行号列的表头标签。',
      default: "'#'",
    },
    {
      name: 'startFrom',
      type: 'number',
      description: '首个序号值。',
      default: '1',
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '返回带右对齐等宽行号列的 TablePlugin，默认从 1 开始。不传 data 时行号用 Table 提供的位置；传入时普通行号跟随它。虚拟窗口化行用父级逻辑位置，非默认 startFrom 回退为完整渲染。',
  propDescriptions: {
    data: '可选数组，普通行号跟随其顺序；省略则用 Table 行位置。',
    getRowKey:
      '与 data 搭配的可选 key 提取器；否则按引用匹配。',
    label: "行号列的表头标签。默认 '#'。",
    startFrom: '首个序号值。默认 1。',
  },
};
