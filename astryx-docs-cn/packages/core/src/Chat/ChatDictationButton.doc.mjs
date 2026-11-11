// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatDictationButton',
  displayName: 'Chat Dictation Button',
  group: 'Chat',
  category: 'Chat',
  isHiddenFromOverview: true,
  hidden: false,

  keywords: ['听写', '麦克风', '语音', '语音识别', '录音', 'stt', 'speech-to-text', '语音输入', 'mic'],

  usage: {
    description:
      'ChatDictationButton 是在聊天编写器内开始和停止语音听写的切换按钮。它与 useChatDictation 搭配：空闲时显示麦克风图标，聆听时显示动态频率条。放在 ChatComposer 的 sendActions 插槽。',
    bestPractices: [
      {guidance: true, description: '把听写按钮放在 ChatComposer 的 sendActions 插槽，紧挨发送按钮——用户预期语音输入控件的位置。'},
      {guidance: true, description: '给 useChatDictation 传 inputRef，让说话过程中的临时转写在编写器输入里以 ghost 文本呈现。'},
      {guidance: true, description: '在 useChatDictation 上启用 hasSounds，让听写开始和停止时有声音反馈；按钮视觉变化不明显时尤其有用。'},
      {guidance: false, description: '不要在聊天编写器之外使用听写按钮；它为编写器的发送操作布局设计，不是独立录音控件。'},
      {guidance: false, description: '别忘了处理不支持的情况。浏览器缺少 SpeechRecognition 时按钮默认自隐藏，但仍应让编写器在没有它的情况下可用。'},
    ],
    anatomy: [
      {name: 'Microphone icon', required: true, description: '空闲状态显示，示意点击将开始语音输入。'},
      {name: 'Frequency bars', required: false, description: '聆听期间替换图标的动态均衡条，随真实麦克风音量起伏。'},
      {name: 'Ghost button', required: true, description: '底层为 ghost 变体 + isIconOnly 的 Button，提供点击热区与焦点环。'},
    ],
  },

  props: [
    {
      name: 'dictation',
      type: 'UseSpeechRecognitionReturn',
      description:
        'useChatDictation 或 useSpeechRecognition 的返回值。控制按钮全部状态：聆听、音量、频段与切换。',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: '按钮尺寸，与 ChatComposer 密度匹配。',
      default: "'md'",
    },
    {
      name: 'isHiddenWhenUnsupported',
      type: 'boolean',
      description:
        '为 true 时浏览器不支持 SpeechRecognition 就不渲染；为 false 时保持按钮可见但禁用。',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '无障碍标签覆盖。默认按状态取 "开始听写" 或 "停止听写"。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],

};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'ChatDictationButton 是在聊天编写器内开始和停止语音听写的切换按钮。它与 useChatDictation 搭配：空闲时显示麦克风图标，聆听时显示动态频率条。放在 ChatComposer 的 sendActions 插槽。',
    bestPractices: [
      {guidance: true, description: '把听写按钮放在 ChatComposer 的 sendActions 插槽，紧挨发送按钮——用户预期语音输入控件的位置。'},
      {guidance: true, description: '给 useChatDictation 传 inputRef，让说话过程中的临时转写在编写器输入里以 ghost 文本呈现。'},
      {guidance: true, description: '在 useChatDictation 上启用 hasSounds，让听写开始和停止时有声音反馈；按钮视觉变化不明显时尤其有用。'},
      {guidance: false, description: '不要在聊天编写器之外使用听写按钮；它为编写器的发送操作布局设计，不是独立录音控件。'},
      {guidance: false, description: '别忘了处理不支持的情况。浏览器缺少 SpeechRecognition 时按钮默认自隐藏，但仍应让编写器在没有它的情况下可用。'},
    ],
  },
  propDescriptions: {
    dictation: 'useChatDictation 或 useSpeechRecognition 的返回值。控制按钮全部状态。',
    size: '按钮尺寸。',
    isHiddenWhenUnsupported: '为 true 时不支持时隐藏听写；为 false 保持禁用按钮可见。',
    label: '无障碍标签覆盖。',
    xstyle: '额外 StyleX 样式。',
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '聊天编写器内语音输入的麦克风切换按钮；空闲=麦克风图标，聆听=频率条；与 useChatDictation 搭配',
  usage: {
    description:
      '聊天编写器内语音听写的切换按钮。与 useChatDictation 搭配。空闲显示麦克风图标，聆听显示动态频率条。放 sendActions 插槽。',
    bestPractices: [
      {guidance: true, description: '放 ChatComposer 的 sendActions 插槽、发送按钮旁。'},
      {guidance: true, description: '给 useChatDictation 传 inputRef，输入框内呈现临时 ghost 文本。'},
      {guidance: true, description: '启用 hasSounds 在开始/停止时给声音反馈。'},
      {guidance: false, description: '不要在聊天编写器之外使用；只为编写器发送操作布局设计。'},
      {guidance: false, description: '别忘了不支持的情况：按钮自隐藏，但编写器应在没有它时照常工作。'},
    ],
  },
  propDescriptions: {
    dictation: 'useChatDictation/useSpeechRecognition 的返回值；控制状态',
    size: '按钮尺寸',
    isHiddenWhenUnsupported: '不支持时隐藏听写；false 保持禁用按钮可见',
    label: '无障碍标签覆盖',
    xstyle: '额外 StyleX 样式',
  },
};
