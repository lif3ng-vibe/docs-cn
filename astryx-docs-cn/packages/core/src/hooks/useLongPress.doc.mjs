// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useLongPress',
  displayName: 'useLongPress',
  keywords: [
    'long press',
    '长按',
    'touch',
    'press and hold',
    'context menu',
    '上下文菜单',
    'mobile',
    'ios',
    'safari',
    'gesture',
    '手势',
    'tap',
  ],
  params: [
    {
      name: 'options',
      type: 'UseLongPressOptions',
      description: '配置对象。',
      required: true,
    },
    {
      name: 'options.onLongPress',
      type: '(point: {x: number; y: number}) => void',
      description:
        '按压持续达到 delayMs 后触发，并携带触摸起始点。',
      required: true,
    },
    {
      name: 'options.disabled',
      type: 'boolean',
      description: '为 true 时，返回的触摸处理器不产生任何效果。',
      default: 'false',
    },
    {
      name: 'options.delayMs',
      type: 'number',
      description: '按压触发前需持续的时长，单位毫秒。',
      default: '500',
    },
    {
      name: 'options.moveCancelPx',
      type: 'number',
      description:
        '任一轴上移动超过该距离即取消按压，视为滚动或拖拽。',
      default: '10',
    },
  ],
  returns: [
    {
      name: 'handlers',
      type: 'UseLongPressHandlers',
      description:
        'onTouchStart、onTouchMove、onTouchEnd 与 onTouchCancel，展开到目标元素上。',
    },
  ],
  usage: {
    description:
      '检测单指长按并报告按下的位置，让触屏用户也能触达指针用户通过右键获得的交互。iOS Safari 在长按时从不合成 contextmenu 事件，因此这是触屏进入 ContextMenu 这类光标定位表面的唯一途径。移动、抬起、多点触控或卸载都会取消按压。长按的计时基于触摸事件自身的时间戳：当繁忙的页面延迟处理抬起动作时，手指按满整个延迟时长仍会先报告长按，再执行抬起逻辑。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用报告的点定位你打开的表面，让它出现在手指下方。',
      },
      {
        guidance: true,
        description:
          '与指针的 contextmenu 处理器搭配而不是替代它；本 hook 只覆盖触屏。',
      },
      {
        guidance: false,
        description:
          '不要把它用于控件的主要操作；长按作为唯一操作途径是无法被发现的。',
      },
    ],
  },
  relatedComponents: ['ContextMenu'],
  relatedHooks: ['useClickableContainer', 'useHotkeys'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '单指长按检测，报告触摸点。iOS Safari 长按从不触发 contextmenu，因此这是进入光标定位表面的唯一触屏途径。移动/抬起/多点触控/卸载时取消。',
  paramDescriptions: {
    options: '配置。',
    'options.onLongPress': 'delayMs 后触发，携带触摸起始点。',
    'options.disabled': 'true = 处理器无效。',
    'options.delayMs': '触发前需持续的时长（毫秒）。',
    'options.moveCancelPx':
      '任一轴移动超过该值（px）即按滚动/拖拽取消。',
  },
  returnDescriptions: {
    handlers:
      'onTouchStart / onTouchMove / onTouchEnd / onTouchCancel，展开到元素上。',
  },
  usage: {
    description:
      "为指针用户需右键才能触达的交互（如 ContextMenu）提供触屏长按。报告该点，让表面在手指下方打开。计时基于触摸事件时间戳：繁忙页面只会延迟上报，不会丢失。",
    bestPractices: [
      {
        guidance: true,
        description: '把打开的表面定位在报告的点。',
      },
      {
        guidance: true,
        description:
          '与指针 contextmenu 处理器搭配；本 hook 只覆盖触屏。',
      },
      {
        guidance: false,
        description:
          '不要让长按成为触达某操作的唯一途径；它无法被发现。',
      },
    ],
  },
};
