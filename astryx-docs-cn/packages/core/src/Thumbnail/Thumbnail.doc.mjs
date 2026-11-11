// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Thumbnail',
  displayName: 'Thumbnail',
  category: 'Content',
  keywords: ["thumbnail","attachment","preview","image","上传","移除","删除","加载"],
  props: [
    {
      name: 'src',
      type: 'string',
      description: '图片源 URL。',
    },
    {
      name: 'alt',
      type: 'string',
      description: '图片的替代文本。省略时，图片被显式标记为装饰性（alt=""、role="presentation"、aria-hidden）并对屏幕阅读器隐藏；alt 和 label 均未设置时开发环境会发出警告。',
    },
    {
      name: 'label',
      type: 'string',
      description: '无障碍标签（如文件名）。悬停时以工具提示显示。',
    },
    {
      name: 'onRemove',
      type: '(e: React.MouseEvent) => void',
      description: '覆盖层移除按钮的回调。',
    },
    {
      name: 'onClick',
      type: '(e: React.MouseEvent) => void',
      description: '点击处理器。添加按钮语义和悬停覆盖层。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '显示骨架屏（无 src）或上传覆盖层（有 src）。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '缩略图是否禁用。',
      default: 'false',
    },
    {
      name: 'showRemoveOn',
      type: "'always' | 'hover'",
      description:
        '移除按钮何时可见。`hover`（默认）在悬停和键盘聚焦时显示，并在任何支持触摸的设备上保持可见；`always` 在静止时也显示。仅在设置 `onRemove` 时生效。',
      default: "'hover'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义（外边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，而不是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description: '根元素的 CSS 类名。样式建议用 xstyle；className 供与非 StyleX 系统集成时使用。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description: '根元素的内联样式。样式建议用 xstyle；内联样式绕过 StyleX 优化。',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: '供自动化测试框架使用的测试选择器。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-thumbnail'},
    ],
    vars: [
      {name: '--_thumbnail-hit-inset', description: '移除按钮不可见命中区域的外扩量，应用在 ::after 覆盖层上。精细指针为 0；粗指针为负值，在不改变所绘内容的情况下把 20px 按钮放大到 24px 触摸目标。', default: '0px', private: true},
      {name: '--_press-overlay', description: '悬停与鼠标状态下 ::after 交互覆盖层的颜色：静止时透明，悬停时（具备悬停能力的指针）用悬停覆盖令牌，鼠标按住 `:active` 时用按压覆盖令牌。触摸按压控制器绘制的按压（`data-astryx-press`）则改为以按压强度绘制覆盖层的图像，该颜色让位于它。由卡片元素自己的交互机制设置在卡片元素上。', default: 'transparent', private: true},
    ],
  },
  usage: {
    description:
      'Thumbnail 显示图片附件的紧凑方形预览。上传时显示微光动画，成功后显示图片，未设置源时显示占位图标。用于聊天输入框、文件上传列表或任何需要小图片预览并可选移除和点击操作的地方。',
    bestPractices: [
      {guidance: true, description: '始终提供带文件名的 label prop，使缩略图及其移除按钮对屏幕阅读器可访问，并在悬停时显示工具提示。'},
      {guidance: true, description: '初次上传期间用不带 src 的 isLoading 显示骨架屏；获得预览 URL 后用带 src 的 isLoading 显示旋转器覆盖层。'},
      {guidance: true, description: '将 onClick 与灯箱或详情视图搭配，让用户查看完整图片；缩略图会自动添加按钮语义和悬停覆盖层。'},
      {guidance: false, description: "不要对 PDF 或电子表格等非图片文件类型使用 Thumbnail；请改用带相应图标的文件附件组件。"},
      {guidance: false, description: "提供 src 时不要省略 alt 文本；屏幕阅读器需要图片内容的描述，而不仅是 label 中的文件名。"},
    ],
    anatomy: [
      {name: 'Image', required: false, description: '预览图片，以方形 cover 适配显示。'},
      {name: 'Placeholder', required: false, description: '未提供 src 时显示的图片剪影图标。'},
      {name: 'Remove button', required: false, description: '右上角的覆盖关闭按钮。设置 onRemove 时出现。位于固定的 --color-overlay 遮罩上，配 --color-on-dark 图标，在任何图片上都保持可见。'},
      {name: 'Upload overlay', required: false, description: '带旋转器的半透明覆盖层，isLoading 为 true 且有 src 预览时显示。'},
      {name: 'Skeleton', required: false, description: 'isLoading 为 true 且未设置 src 时显示的微光动画。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  propDescriptions: {
    src: '\u56FE\u7247\u6E90 URL\u3002',
    alt: '\u56FE\u7247\u7684\u66FF\u4EE3\u6587\u672C\u3002\u7701\u7565\u65F6\u56FE\u7247\u4F1A\u88AB\u663E\u5F0F\u6807\u8BB0\u4E3A\u88C5\u9970\u6027\uFF08alt=""\u3001role="presentation"\u3001aria-hidden\uFF09\u5E76\u5BF9\u5C4F\u5E55\u9605\u8BFB\u5668\u9690\u85CF\uFF1B\u82E5 alt \u548C label \u5747\u672A\u8BBE\u7F6E\uFF0C\u5F00\u53D1\u73AF\u5883\u4F1A\u53D1\u51FA\u8B66\u544A\u3002',
    label: '\u65E0\u969C\u788D\u6807\u7B7E\uFF08\u5982\u6587\u4EF6\u540D\uFF09\u3002\u60AC\u505C\u65F6\u4EE5\u63D0\u793A\u5DE5\u5177\u663E\u793A\u3002',
    onRemove: '\u8986\u76D6\u5C42\u79FB\u9664\u6309\u94AE\u7684\u56DE\u8C03\u3002',
    onClick: '\u70B9\u51FB\u5904\u7406\u5668\u3002\u6DFB\u52A0\u6309\u94AE\u8BED\u4E49\u548C\u60AC\u505C\u8986\u76D6\u5C42\u3002',
    isLoading: '\u663E\u793A\u9AA8\u67B6\u5C4F\uFF08\u65E0 src\uFF09\u6216\u4E0A\u4F20\u8986\u76D6\u5C42\uFF08\u6709 src\uFF09\u3002',
    isDisabled: '\u662F\u5426\u7981\u7528\u7F29\u7565\u56FE\u3002',
    showRemoveOn: '\u4F55\u65F6\u663E\u793A\u79FB\u9664\u6309\u94AE\uFF1Ahover\uFF08\u9ED8\u8BA4\uFF0C\u60AC\u505C\u65F6\u4EE5\u53CA\u952E\u76D8\u805A\u7126\u65F6\u663E\u793A\uFF0C\u89E6\u6478\u8BBE\u5907\u4E0A\u4FDD\u6301\u53EF\u89C1\uFF09| always\uFF08\u59CB\u7EC8\u663E\u793A\uFF09\u3002\u4EC5\u5728\u8BBE\u7F6E onRemove \u65F6\u751F\u6548\u3002',
    xstyle: '\u7528\u4E8E\u5E03\u5C40\u81EA\u5B9A\u4E49\u7684 StyleX \u6837\u5F0F\u3002\u5FC5\u987B\u662F stylex.create() \u7684\u503C\uFF0C\u800C\u975E\u5185\u8054\u6837\u5F0F\u5BF9\u8C61\u3002',
    className: '\u6839\u5143\u7D20\u7684 CSS \u7C7B\u540D\u3002\u5EFA\u8BAE\u4F7F\u7528 xstyle\u3002',
    style: '\u6839\u5143\u7D20\u7684\u5185\u8054\u6837\u5F0F\u3002\u5EFA\u8BAE\u4F7F\u7528 xstyle\u3002',
    'data-testid': '\u7528\u4E8E\u81EA\u52A8\u5316\u6D4B\u8BD5\u6846\u67B6\u7684\u6D4B\u8BD5\u9009\u62E9\u5668\u3002',
  },
  usage: {
    description:
      'Thumbnail \u662F\u56FE\u7247\u9644\u4EF6\u7684\u65B9\u5F62\u9884\u89C8\u5361\u7247\u3002\u4E0A\u4F20\u65F6\u663E\u793A\u9AA8\u67B6\u5C4F\u52A8\u753B\uFF0C\u6210\u529F\u540E\u663E\u793A\u56FE\u7247\uFF0C\u672A\u8BBE\u7F6E\u6E90\u65F6\u663E\u793A\u5360\u4F4D\u56FE\u6807\u3002\u7528\u4E8E\u804A\u5929\u7F16\u8F91\u5668\u3001\u6587\u4EF6\u4E0A\u4F20\u5217\u8868\u6216\u4EFB\u4F55\u9700\u8981\u7D27\u51D1\u56FE\u7247\u9884\u89C8\u7684\u573A\u666F\u3002',
    bestPractices: [
      {guidance: true, description: '\u59CB\u7EC8\u63D0\u4F9B label \u5C5E\u6027\u5E76\u586B\u5199\u6587\u4EF6\u540D\uFF0C\u4EE5\u4FBF\u5C4F\u5E55\u9605\u8BFB\u5668\u80FD\u591F\u8BC6\u522B\u7F29\u7565\u56FE\u53CA\u5176\u79FB\u9664\u6309\u94AE\uFF0C\u5E76\u5728\u60AC\u505C\u65F6\u663E\u793A\u63D0\u793A\u3002'},
      {guidance: true, description: '\u4E0A\u4F20\u521D\u671F\u4F7F\u7528\u4E0D\u5E26 src \u7684 isLoading \u663E\u793A\u9AA8\u67B6\u5C4F\uFF1B\u83B7\u5F97\u9884\u89C8 URL \u540E\u4F7F\u7528\u5E26 src \u7684 isLoading \u663E\u793A\u65CB\u8F6C\u52A0\u8F7D\u8986\u76D6\u5C42\u3002'},
      {guidance: true, description: '\u5C06 onClick \u4E0E\u706F\u7BB1\u6216\u8BE6\u60C5\u89C6\u56FE\u914D\u5BF9\uFF0C\u4EE5\u4FBF\u7528\u6237\u67E5\u770B\u5B8C\u6574\u56FE\u7247\u2014\u2014\u7EC4\u4EF6\u4F1A\u81EA\u52A8\u6DFB\u52A0\u6309\u94AE\u8BED\u4E49\u548C\u60AC\u505C\u8986\u76D6\u5C42\u3002'},
      {guidance: false, description: '\u5BF9 PDF \u6216\u7535\u5B50\u8868\u683C\u7B49\u975E\u56FE\u7247\u6587\u4EF6\u7C7B\u578B\u4F7F\u7528 Thumbnail\u2014\u2014\u5E94\u4F7F\u7528\u5E26\u6709\u76F8\u5E94\u56FE\u6807\u7684\u6587\u4EF6\u9644\u4EF6\u7EC4\u4EF6\u3002'},
      {guidance: false, description: '\u63D0\u4F9B src \u65F6\u7701\u7565 alt \u6587\u672C\u2014\u2014\u5C4F\u5E55\u9605\u8BFB\u5668\u9700\u8981\u56FE\u7247\u5185\u5BB9\u7684\u63CF\u8FF0\uFF0C\u800C\u4E0D\u4EC5\u662F label \u4E2D\u7684\u6587\u4EF6\u540D\u3002'},
    ],
  },
};

export const docsDense = {
  description:
    '图片附件的方形预览卡片。上传时骨架微光，成功后显示图片，无 src 时显示占位。',
  usage: {
    description:
      '紧凑的方形图片预览。上传时微光，成功后显示图片，为空时占位。用于聊天输入框、文件列表或小型媒体预览。',
    bestPractices: [
      {guidance: true, description: '始终设置 label（文件名）以保证无障碍；驱动屏幕阅读器播报 + 悬停工具提示。'},
      {guidance: true, description: '不带 src 的 isLoading → 骨架屏；带 src 的 isLoading → 旋转器覆盖层。两种不同的加载状态。'},
      {guidance: true, description: 'onClick 添加按钮语义 + 悬停覆盖层；搭配灯箱查看完整预览。'},
      {guidance: false, description: "不要用于非图片文件（PDF、xlsx）；请改用带图标的文件附件组件。"},
      {guidance: false, description: "有 src 时不要省略 alt；屏幕阅读器需要图片内容描述，而不仅是 label。"},
    ],
  },
  propDescriptions: {
    src: '图片源 URL。',
    alt: '图片替代文本。省略 → 显式装饰性（alt="" + role="presentation" + aria-hidden）；设置 src 但无 alt 且无 label 时开发警告。',
    label: '无障碍标签（文件名）。悬停工具提示，aria-label。',
    onRemove: '(e) => void。覆盖层移除按钮的回调。',
    onClick: '(e) => void。添加按钮语义 + 悬停覆盖层。',
    isLoading: '骨架屏（无 src）或上传覆盖层（有 src）。默认 false。',
    isDisabled: '禁用状态。默认 false。',
    showRemoveOn: "移除按钮何时显示：hover（默认：悬停/聚焦时显示，触摸设备保持可见）| always。仅在设置 onRemove 时生效。",
    xstyle: '布局用 stylex.create()。',
    className: 'CSS 类。建议用 xstyle。',
    style: '内联样式。建议用 xstyle。',
    'data-testid': '测试选择器。',
  },
};
