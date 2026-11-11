// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Stepper',
  displayName: 'Stepper',
  category: 'Navigation',
  group: 'Stepper',
  keywords: [
    'stepper',
    'steps',
    'wizard',
    '步骤器',
    '步骤',
    '向导',
    '工作流',
    'progress',
    '多步骤',
    '表单向导',
    '引导流程',
  ],
  usage: {
    description:
      '步骤器展示通过一系列逻辑编号步骤的进度。用于多步骤工作流，如表单、引导流程或结账流程——用户需要看到自己的位置与后续步骤。渲染为有序列表（不是导航地标）。',
    bestPractices: [
      {
        guidance: true,
        description:
          '步骤标签保持简短且具有描述性：用 "Payment" 而不是 "Enter your payment information"。',
      },
      {
        guidance: true,
        description:
          '步骤带较长描述时使用垂直方向。水平步骤器会自行处理窄容器：一旦框架给每个步骤的宽度低于 horizontalOptions.minimumStepWidth（默认 112px），它就收起标签改为分段轨道，并在其下使用配置的 collapsedVariant。',
      },
      {
        guidance: true,
        description:
          "页面已提供返回/继续时，把 horizontalOptions.collapsedVariant 设为 'withLabel'；周围界面同时掌管当前步骤标题与导航、只需要裸进度轨道时，设为 'hiddenLabel'。",
      },
      {
        guidance: true,
        description:
          '非线性工作流（用户可能需要回访较早步骤）请提供 onStepClick。',
      },
      {
        guidance: true,
        description:
          'status 只用于应用语义颜色（accent/success/warning/error）；更丰富的指示器请传自定义图标。',
      },
      {
        guidance: false,
        description:
          '少于 3 个步骤时不要用步骤器；简单标题或进度条更合适。',
      },
      {
        guidance: false,
        description:
          '不要超过 7 个步骤；考虑把相关步骤分组或换用其他模式。',
      },
    ],
    anatomy: [
      {
        name: 'Stepper',
        required: true,
        description:
          '容纳各步骤的有序列表。掌控整个流程的布局方向与指示器位置。',
      },
      {
        name: 'Frame',
        required: true,
        description:
          '布局框架，把有序步骤与窄宽度下显示的可选紧凑摘要组合在一起。',
      },
      {
        name: 'Compact summary',
        required: false,
        description:
          '水平步骤器在过窄无法标注每个步骤时，直接在轨道下方添加的可选行。horizontalOptions.collapsedVariant 可选择带上一/下一步控件的标签、仅标签，或不显示该行只留裸进度轨道。on-track 布局的指示器保留在轨道上，而不是在标签旁重复活动指示器。任何宽度下每个步骤都在无障碍序列中保留名称。',
      },
      {
        name: 'Step',
        required: true,
        description:
          '流程中的一个步骤，也是承载其状态的元素。包裹指示器、标签、描述及其所属的轨道分段。',
      },
      {
        name: 'Progress bar',
        required: true,
        description:
          '每个步骤一段 4px 分段条，已完成与进行中的步骤为填充态。前进一步时，填充沿刚跨过的轨道增长，因此动效读起来是进度推进，而不是条变色。其余所有变化都立即生效：回退、一次前跳多步、流程中途挂载，以及 prefers-reduced-motion 下的任何变化。当一段跨度由多个分段绘制时（on-track 布局会在两个步骤间拆分，中间有内容插槽时为三段），各分段按轨道顺序以恒定速度推进，填充读起来是一条线在生长，而不是分段依次点亮。',
      },
      {
        name: 'Connector',
        required: false,
        description:
          'on-track 布局中绘制在指示器之间的轨道。每段连接线先绘制未填充线条，再在其上绘制覆盖已完进度的 accent 填充。一段连接线由几个分段组成是布局的实现细节，不是可主题化部分；用 --step-connector-gap 让轨道与指示器保持间距。',
      },
      {
        name: 'Indicator',
        required: false,
        description:
          '数字徽章、对勾或任意自定义图标。由 indicator prop 控制。',
      },
      {
        name: 'Label',
        required: true,
        description: '标识步骤的文本。',
      },
      {
        name: 'Description',
        required: false,
        description: '标签下方的辅助文本，提供补充上下文。',
      },
    ],
  },
  theming: {
    targets: [
      {
        className: 'astryx-stepper',
        visualProps: ['orientation', 'indicatorPosition'],
      },
      {className: 'astryx-stepper-frame'},
      {className: 'astryx-stepper-summary'},
      {className: 'astryx-step', visualProps: ['progress', 'status']},
      {className: 'astryx-step-indicator', visualProps: ['progress', 'status']},
      {
        className: 'astryx-step-label',
        visualProps: ['progress', 'status', 'disabled'],
      },
      {
        className: 'astryx-step-description',
        visualProps: ['progress', 'status'],
      },
      {className: 'astryx-step-bar'},
      {className: 'astryx-step-connector'},
    ],
    vars: [
      {
        name: '--step-connector-gap',
        description:
          '连接线在与指示器相接处留出的间隙，落在朝向指示器的一侧。适用于 on-track 布局——其连接线由节点两侧各一段绘制；取 0 时轨道不间断地穿过节点。',
        default: '0px',
      },
    ],
  },
  components: [
    {
      name: 'Stepper',
      displayName: 'Stepper',
      description:
        '容器组件，管理步骤状态并以水平或垂直方向把步骤渲染为有序列表。',
      props: [
        {
          name: 'activeStep',
          type: 'number',
          description:
            '当前活动步骤的从零开始索引。此索引之前的步骤标记为已完成。',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '要在步骤器中渲染的 Step 元素。',
          required: true,
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          description: '步骤器的布局方向。',
          default: "'horizontal'",
        },
        {
          name: 'onStepClick',
          type: '(index: number) => void',
          description:
            '点击步骤或使用紧凑摘要控件时调用。启用非线性导航。水平步骤器折叠前，每个步骤都是按钮：可用步骤可激活；禁用步骤保持可聚焦并播报为不可用，但不会激活。折叠后，导航转移到会跳过禁用步骤的摘要控件。',
        },
        {
          name: 'label',
          type: 'string',
          description:
            '描述这组步骤的无障碍标签（应用于有序列表）。默认为本地化的 "Progress"。',
          default: "'Progress' (localized)",
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: '控制所有步骤的内边距。',
          default: "'balanced'",
        },
        {
          name: 'indicatorPosition',
          type: "'separated' | 'on-track'",
          description:
            '步骤指示器相对于连接轨道的位置。',
          default: "'separated'",
        },
        {
          name: 'horizontalOptions',
          type: "{ minimumStepWidth: number; collapsedVariant: 'withLabelAndControls' | 'withLabel' | 'hiddenLabel' }",
          description:
            '水平收起选项。minimumStepWidth 是每步骤的像素阈值。collapsedVariant 选择带控件的标签、仅标签，或不带紧凑行的裸进度轨道。仅当设置 onStepClick 且为 withLabelAndControls 时显示控件，且每个步骤始终保留无障碍名称。',
          default:
            "{ minimumStepWidth: 112, collapsedVariant: 'withLabelAndControls' }",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
        },
      ],
    },
    {
      // Name-only cross-reference. Step's full documentation (description,
      // props) lives in Step.doc.mjs as a `subComponentOf: 'Stepper'` doc, so
      // it is emitted once from there and skipped here to avoid double emission.
      name: 'Step',
    },
  ],
  // A Stepper draws nothing on its own — every bar, indicator, and label comes
  // from its Steps — so without seeded children the preview opens on an empty
  // stage and the orientation/density/indicator knobs have nothing to act on.
  // Three steps is the smallest set that shows all three progress states at
  // once: completed, current, and upcoming.
  playground: {
    defaults: {
      activeStep: 1,
      children: [
        {__element: 'Step', props: {step: 0, label: '购物车'}},
        {__element: 'Step', props: {step: 1, label: '配送'}},
        {__element: 'Step', props: {step: 2, label: '支付'}},
      ],
    },
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '多步骤工作流的编号步骤序列',
  usage: {
    description:
      '步骤器展示编号步骤的进度。用于表单、引导、结账。',
    bestPractices: [
      {
        guidance: true,
        description:
          '步骤标签保持简短。水平方向在每步低于 horizontalOptions.minimumStepWidth（默认 112px）时收起；垂直方向适合长描述。',
      },
      {
        guidance: true,
        description:
          '页面自带返回/继续，或同时掌管步骤标题与导航时，选择 horizontalOptions.collapsedVariant。',
      },
      {
        guidance: true,
        description: '非线性工作流请提供 onStepClick。',
      },
      {
        guidance: false,
        description: '少于 3 步或多于 7 步时不要用。',
      },
    ],
  },
  components: [
    {
      name: 'Stepper',
      displayName: 'Stepper',
      description: '管理步骤状态的容器，支持水平/垂直布局',
      propDescriptions: {
        activeStep: '从零开始的活动步骤索引',
        children: 'Step 元素',
        orientation: '水平或垂直布局',
        onStepClick:
          '启用非线性导航；紧凑导航由摘要控件负责并跳过禁用步骤',
        label: '有序列表的 aria-label',
        density: '所有步骤的内边距',
        indicatorPosition: '指示器与轨道分离或置于轨道上',
        horizontalOptions: '水平收起阈值与标签/控件呈现',
        xstyle: 'StyleX 布局自定义',
      },
    },
    {
      name: 'Step',
      displayName: 'Step',
      description: '单个步骤，带进度条、指示器与标签',
      propDescriptions: {
        step: '从零开始的步骤索引',
        label: '步骤标签文本',
        description: '标签下方的辅助文本',
        status: '语义颜色：accent/success/warning/error（仅颜色）',
        indicator: "'auto' | 'number' | 'none' | 自定义节点",
        isDisabled: '禁用交互',
        isOptional: '附加 Optional 标识',
        endContent: '标签行中的尾部内容',
        density: '单步骤内边距覆盖',
      },
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Stepper',
  displayName: 'Stepper',
  group: 'Stepper',
  usage: {
    description:
      '步骤器显示通过一系列逻辑编号步骤的进度。用于多步骤工作流程，如表单、入职流程或结账流程。',
    bestPractices: [
      {guidance: true, description: '保持步骤标签简短和描述性。'},
      {
        guidance: true,
        description:
          '当步骤有较长描述时使用垂直方向。水平步骤器会自行处理窄容器：当每个步骤的可用宽度不足 horizontalOptions.minimumStepWidth（默认为 112px）时，它会收起标签，并按 collapsedVariant 显示紧凑内容。',
      },
      {
        guidance: true,
        description:
          "当页面已有返回/继续控件时，将 horizontalOptions.collapsedVariant 设为 'withLabel'；当周围界面同时提供当前步骤标题和导航、只需要裸进度轨道时，将其设为 'hiddenLabel'。",
      },
      {guidance: true, description: '为非线性工作流程提供 onStepClick。'},
      {guidance: false, description: '少于3个步骤时使用步骤器。'},
      {guidance: false, description: '超过7个步骤时使用步骤器。'},
    ],
  },
  theming: {
    targets: [
      {
        className: 'astryx-stepper',
        visualProps: ['orientation', 'indicatorPosition'],
      },
      {className: 'astryx-stepper-frame'},
      {className: 'astryx-stepper-summary'},
      {className: 'astryx-step', visualProps: ['progress', 'status']},
      {className: 'astryx-step-indicator', visualProps: ['progress', 'status']},
      {
        className: 'astryx-step-label',
        visualProps: ['progress', 'status', 'disabled'],
      },
      {
        className: 'astryx-step-description',
        visualProps: ['progress', 'status'],
      },
      {className: 'astryx-step-bar'},
      {className: 'astryx-step-connector'},
    ],
    vars: [
      {
        name: '--step-connector-gap',
        description:
          '连接线与指示器相接处留出的间隙，落在朝向指示器的一侧。适用于 on-track 布局——其连接线由节点两侧各一段绘制；取 0 时轨道将不间断地穿过节点。',
        default: '0px',
      },
    ],
  },
  components: [
    {
      name: 'Stepper',
      displayName: 'Stepper',
      description: '容器组件，管理步骤状态并以水平或垂直方向渲染步骤。',
      props: [
        {
          name: 'activeStep',
          type: 'number',
          description: '当前活动步骤的从零开始的索引。',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '要在步骤器中渲染的 Step 元素。',
          required: true,
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          description: '步骤器的布局方向。',
          default: "'horizontal'",
        },
        {
          name: 'onStepClick',
          type: '(index: number) => void',
          description:
            '点击步骤或紧凑摘要控件时调用。启用非线性导航；水平步骤器折叠后，导航转移到会跳过已禁用步骤的摘要控件。',
        },
        {
          name: 'label',
          type: 'string',
          description: '有序列表的无障碍标签。',
          default: "'Progress'（本地化）",
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: '控制所有步骤的内边距。',
          default: "'balanced'",
        },
        {
          name: 'indicatorPosition',
          type: "'separated' | 'on-track'",
          description: '步骤指示器相对于连接轨道的位置。',
          default: "'separated'",
        },
        {
          name: 'horizontalOptions',
          type: "{ minimumStepWidth: number; collapsedVariant: 'withLabelAndControls' | 'withLabel' | 'hiddenLabel' }",
          description:
            '水平布局的收起选项。minimumStepWidth 是每个步骤的像素阈值。collapsedVariant 可选择显示标签和控件、仅显示标签，或只显示裸进度轨道而不显示紧凑行。仅当 collapsedVariant 为 withLabelAndControls 且设置 onStepClick 时显示控件，每个步骤始终保留无障碍名称。',
          default:
            "{ minimumStepWidth: 112, collapsedVariant: 'withLabelAndControls' }",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description: '用于布局自定义的 StyleX 样式。',
        },
      ],
    },
    {
      name: 'Step',
      displayName: 'Step',
      description: '步骤器中的单个步骤。渲染进度条、指示器和带可选描述的标签。',
      props: [
        {
          name: 'step',
          type: 'number',
          description: '此步骤的从零开始的索引。',
          required: true,
        },
        {
          name: 'label',
          type: 'string',
          description: '步骤标签文本。',
          required: true,
        },
        {
          name: 'description',
          type: 'string',
          description: '标签下方的可选描述。',
        },
        {
          name: 'status',
          type: "'accent' | 'success' | 'warning' | 'error'",
          description: '步骤的语义颜色，仅控制颜色。',
        },
        {
          name: 'indicator',
          type: "'auto' | 'number' | 'none' | ReactNode",
          description: '指示器显示内容。',
          default: "'auto'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '禁用交互并使步骤指示器和标签变暗。',
          default: 'false',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description: '标记步骤为可选。',
          default: 'false',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: '标签行末尾的尾随内容。',
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: '步骤的内边距覆盖。',
        },
      ],
    },
  ],
};
