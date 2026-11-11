// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'SegmentedControlItem',
  subComponentOf: 'SegmentedControl',
  displayName: 'Segmented Control Item',
  isHiddenFromOverview: true,
  description: '单个分段项，在分段控件中渲染为单选按钮。',
  // SegmentedControlItem requires SegmentedControl context; wrap it so the preview doesn't throw.
  playground: {
    defaults: {value: 'item-1', label: 'Item'},
    wrapper: {
      component: 'SegmentedControl',
      props: {value: 'item-1', label: 'Segmented control'},
    },
  },
  props: [
    {
      name: 'value',
      type: 'string',
      description: '该分段的唯一值，与父组件的 value 匹配。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '该分段的无障碍标签。除非 isLabelHidden 为 true，否则渲染为可见文本。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '是否在视觉上隐藏标签。为 true 时仅显示图标，label 用作 aria-label。',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '显示在标签前的图标元素。',
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
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '是否禁用该单个项。被禁用的选中项仍保留控件的 Tab 停留点。',
      default: 'false',
    },
  ],
};

export const docsZh = {
  name: 'SegmentedControlItem',
  isHiddenFromOverview: true,
  displayName: 'Segmented Control Item',
  description: '单个分段项，在分段控件中渲染为单选按钮。',
  propDescriptions: {
    value: '该分段的唯一值，与父组件的 value 匹配。',
    label: '该分段的无障碍标签。除非 isLabelHidden 为 true，否则渲染为可见文本。',
    isLabelHidden: '是否在视觉上隐藏标签。为 true 时仅显示图标，label 用作 aria-label。',
    icon: '显示在标签前的图标元素。',
    isDisabled: '是否禁用该单个项。',
  },
};

export const docsDense = {
  name: 'SegmentedControlItem',
  isHiddenFromOverview: true,
  displayName: 'Segmented Control Item',
  description: '单个分段项；在控件中渲染为单选按钮',
  propDescriptions: {
    value: '分段唯一值；与父组件匹配',
    label: '分段标签；除非 isLabelHidden 否则可见',
    isLabelHidden: '视觉上隐藏标签；label 改用作 aria-label',
    icon: '标签前的图标',
    isDisabled: '禁用该项',
  },
};
