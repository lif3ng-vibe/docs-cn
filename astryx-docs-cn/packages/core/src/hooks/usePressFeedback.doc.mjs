// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'usePressFeedback',
  displayName: 'usePressFeedback',
  keywords: [
    'press',
    '按压',
    'pressed',
    'active',
    'touch',
    'tap',
    'coarse pointer',
    'pressable',
    'interaction state',
    '交互状态',
  ],
  params: [],
  returns: [
    {
      name: 'pressableProps',
      type: "{'data-astryx-pressable': ''}",
      description:
        "展开到绘制按压效果的元素上的标记属性。在同一个元素上组合 `interactionOverlayStyles` 之一（来自 `@astryxdesign/core/utils`）——悬停与按压都用系统遮罩层的表面用 `backgroundColor` 或 `backgroundImage`，悬停样式自有的表面用 `pressedBackgroundColor`——它会在按压第一帧绘出按压令牌并随释放淡出，桌面上鼠标仍走 `:active`。在手机或平板上，样式表已去掉 `:active`，控制器同样绘出鼠标、触控板或空格键的按压：立即绘出，按键按住期间保持，释放时淡出。按压效果通过 `--color-overlay-pressed` 主题化。",
    },
  ],
  usage: {
    description:
      '每个 Astryx pressable 都在用的触摸按压模型，适用于自行绘制按压效果的本地组件。在手指下，CSS `:active` 作用于触摸本身，且可能延续到滚动开始之后；按压模型则像 UIKit 跟踪控件那样跟踪触摸：手指落下即高亮（滚动容器内有内容触摸延迟，此时甩动不绘任何效果），快速点按在抬手时响应，滚动能取消触摸且不淡出。一个 document 级控制器为所有标记元素执行这套逻辑（由第一个挂载的 pressable 安装，最后一个卸载时移除），因此调用该 hook 不会给你的元素添加任何监听器或状态。桌面上鼠标按压仍走你的 `:active` 规则：保留它，并像内置组件那样在 `@media (pointer: coarse)` 下去掉。该查询读取主指针，因此在手机或平板上它也会为已连接的鼠标、触控板或键盘去掉 `:active`；由控制器绘出这些按压（立即绘出、释放时淡出），确保任何按压都有响应。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把结果展开到背景绘制按压效果的元素上，并在其上组合 `interactionOverlayStyles` 之一；组合出的样式就是即时起效、按住保持与淡出，并通过 `--color-overlay-pressed` 主题化。',
      },
      {
        guidance: true,
        description:
          '让组合样式在所有指针上负责按压：它为桌面鼠标保留 `:active`，并在 `@media (pointer: coarse)` 下去掉它——那里由控制器绘出每种按压（手指走按压模型，鼠标或空格键立即绘出）。自行绘制的 `:active` 规则在手指下也会生效，且会贯穿滚动。',
      },
      {
        guidance: false,
        description:
          '不要给元素添加指针监听器或 React 状态来跟踪按压；控制器已写入该属性，而逐元素监听器正是长列表承受不起的东西。',
      },
      {
        guidance: false,
        description:
          '不要对由 Astryx 组件渲染的控件调用它；那些已带标记，且按压由最内层的标记元素承接。',
      },
    ],
  },
  relatedComponents: ['Button', 'Item', 'ClickableCard'],
  relatedHooks: ['useLongPress'],
  importPath: '@astryxdesign/core/hooks',
  category: 'motion & gestures',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '把元素标记为触摸按压模型的 pressable 表面，像 UIKit 控件那样跟踪（手指落下即高亮，滚动容器内 150 ms，抬手淡出），并安装共享的 document 控制器；主指针为 coarse 时还会立即绘出鼠标、触控板与空格键按压。返回要展开的 data-astryx-pressable 标记；在同一个元素上组合 interactionOverlayStyles 之一来绘制。',
  paramDescriptions: {},
  returnDescriptions: {
    pressableProps:
      '展开到绘制元素上的标记属性；在其上组合 interactionOverlayStyles 之一（backgroundColor、backgroundImage、pressedBackgroundColor），即可在所有指针上绘出按压；通过 --color-overlay-pressed 主题化。',
  },
  usage: {
    description:
      '用于自行绘制按压效果、且必须在手指下与 Astryx 表现一致的本地组件。无逐元素监听器或状态；每个 document 一个控制器。',
    bestPractices: [
      {
        guidance: true,
        description:
          '展开到绘制元素上并在其上组合 interactionOverlayStyles 之一；不要自行添加 :active 规则。',
      },
      {
        guidance: false,
        description:
          '不要用自建的指针监听器或状态跟踪按压，也不要对 Astryx 组件（已带标记）调用。',
      },
    ],
  },
};
