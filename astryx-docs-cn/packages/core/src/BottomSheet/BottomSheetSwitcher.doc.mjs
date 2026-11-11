// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */

const anatomy = [
  {
    name: 'Sheet dialogs',
    required: true,
    description:
      '每个子面板一个原生 dialog，由切换器呈现和关闭；承载活动面板的 dialog 携带流程的 ref、id、模态性与关闭行为。',
  },
  {
    name: 'Sheet panels',
    required: true,
    description:
      '直接的 BottomSheet 子元素；同一时刻恰有一个可交互，切换衔接期间上一个面板可能保持可见但为 inert。',
  },
  {
    name: 'Scrim',
    required: false,
    description:
      '默认带遮罩的模态呈现显示的原生 dialog 背景；同一时刻只有一个面板 dialog 绘制它，因此衔接绝不会让页面变暗两次。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'BottomSheetSwitcher',
  displayName: 'Bottom Sheet Switcher',
  group: 'BottomSheet',
  category: 'Overlay',
  keywords: ['底部面板', '切换器', '多步', '流程', '向导'],
  deprecated: {
    replacement: 'BottomSheet',
    description:
      '请把每个步骤写成独立的 BottomSheet 并用 isOpen 控制，由一个状态值命名打开的步骤；从打开步骤内部继续时原地替换（见 BottomSheet 的 "替换面板"）。BottomSheetSwitcher 在未来 minor 版本移除前保持可用。',
  },
  playground: {
    overlay: true,
    overlayControl: {
      stateProp: 'activeSheet',
      openValue: 'details',
    },
    defaults: {
      activeSheet: null,
      children: [
        {
          __element: 'BottomSheet',
          props: {
            sheetId: 'details',
            label: '设置详情',
            height: 'hug',
          },
          children: {
            __element: 'Section',
            props: {padding: 4},
            children: {
              __element: 'VStack',
              props: {gap: 2},
              children: [
                {
                  __element: 'Heading',
                  props: {level: 3},
                  children: '设置详情',
                },
                {
                  __element: 'Text',
                  props: {type: 'body'},
                  children: '填写本次设置的关键信息。',
                },
                {
                  __element: 'Text',
                  props: {type: 'supporting'},
                  children: '保存前可以核对这些详情。',
                },
              ],
            },
          },
        },
        {
          __element: 'BottomSheet',
          props: {
            sheetId: 'preferences',
            label: '选择偏好',
            height: 'hug',
          },
          children: {
            __element: 'Section',
            props: {padding: 4},
            children: {
              __element: 'VStack',
              props: {gap: 2},
              children: [
                {
                  __element: 'Heading',
                  props: {level: 3},
                  children: '选择偏好',
                },
                {
                  __element: 'Text',
                  props: {type: 'body'},
                  children: '选择本次设置的行为方式。',
                },
                {
                  __element: 'Text',
                  props: {type: 'supporting'},
                  children:
                    '通知可以立即、每日或每周发送。',
                },
                {
                  __element: 'Text',
                  props: {type: 'supporting'},
                  children: '之后可以更新这些偏好。',
                },
              ],
            },
          },
        },
        {
          __element: 'BottomSheet',
          props: {
            sheetId: 'confirm',
            label: '确认设置',
            height: 'hug',
          },
          children: {
            __element: 'Section',
            props: {padding: 4},
            children: {
              __element: 'VStack',
              props: {gap: 2},
              children: [
                {
                  __element: 'Heading',
                  props: {level: 3},
                  children: '确认设置',
                },
                {
                  __element: 'Text',
                  props: {type: 'body'},
                  children: '一切就绪，可以保存。',
                },
              ],
            },
          },
        },
      ],
    },
  },
  description:
    '已弃用：请把每个步骤写成独立的 BottomSheet 并用 isOpen 控制，由一个状态值命名打开的步骤。在同一次更新中从打开步骤内的控件关闭顶层面板并打开下一步，会执行同样的替换衔接（见 BottomSheet 的 "替换面板"），无需 sheetId 也无需切换器；由流程外的控件（页面控件，或焦点离开步骤后的代码）改变步骤时，以普通的推入弹出动作关闭和打开。BottomSheetSwitcher 在未来 minor 版本移除前保持可用：独立使用的流程行为与发布版一致（含三处修复：步骤内弹出的 toast 渲染在流程上方且可点击；减弱动效下步骤遵循减弱动效规则；带 hasAutoFocus 字段的步骤在所有浏览器中都在该字段上打开），与其他面板堆叠的流程是堆叠中的一层（被覆盖时后退并被阻挡，共享唯一遮罩，被覆盖期间退出关闭竞争）。模态与 hasScrim={false} 流程以同样方式迁移。BottomSheetSwitcher 将多个 BottomSheet 协调为互斥流程。一个 activeSheet ID 选出唯一可交互面板；衔接期间，新面板在保持 inert 的上一个面板上方进入。若新面板更矮，上一个面板同时下移，直到两者顶边对齐，随后在两个变换完成后淡出。每个子面板渲染自己的原生 <dialog>：模态流程用 showModal() 呈现每个面板，与独立模态面板一致，因此由浏览器提供模态性（页面 inert、焦点留在顶层 dialog，两者都跨衔接保持），切换器为整个模态流程统一持有一个 body 滚动锁定。无遮罩流程在切换器隔离的流程包装内用 show() 呈现每个面板，以局部值排列步骤 dialog；这与独立的 hasScrim={false} 面板不同——后者以手动 popover 形式驻留顶层、无页面级 z-index，这也是迁移的理由之一。其余由切换器协调：同一时刻只绘制一层遮罩，焦点返回打开流程的元素，其 ref、id 与 data-testid 解析到承载活动面板的 dialog，其他 dialog props 与处理器应用于每个面板 dialog。',
  props: [
    {
      name: 'ref',
      type: 'Ref<HTMLDialogElement>',
      description:
        '解析到承载流程的原生 dialog 的 ref：活动面板的 dialog，衔接时切换到下一个面板的；退场面板在退场期间的；流程关闭时则是最后承载它的 dialog（或第一个挂载面板的）。从首次提交起，只要面板挂载着它就绝不为 null。id 与 data-testid 只渲染在这个 dialog 上：以打开状态挂载的流程在服务端标记中也携带在活动面板的 dialog 上；以关闭状态挂载的流程从首次提交的同步重渲染起携带，其服务端标记不携带在任何元素上。其他 dialog props 应用于每个面板 dialog。',
    },
    {
      name: 'onCancel',
      type: '(event: SyntheticEvent<HTMLDialogElement>) => void',
      description:
        '在切换器处理原生取消请求（Escape 或平台关闭）之前调用。挂接在每个面板 dialog 上；浏览器在它正在呈现的 dialog（活动面板的）上触发 cancel。调用 preventDefault() 可让受控流程保持打开。',
    },
    {
      name: 'activeSheet',
      type: 'string | null',
      description:
        '可交互 BottomSheet 的 ID，流程应关闭时为 null。与嵌套 BottomSheet 的唯一 sheetId 匹配；新面板进入时上一个面板可保持可见但 inert，在新步骤更矮时同步下移对齐，随后淡出。',
      required: true,
    },
    {
      name: 'onActiveSheetChange',
      type: '(activeSheet: string | null) => void',
      description:
        "活动面板按其 purpose 隐式关闭时以 null 调用。子 BottomSheet 可用 purpose='form' 或 purpose='required' 限制隐式关闭，同时流程控件仍可用同一个状态设置器切换面板或关闭流程。",
      required: true,
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description:
        "面板 dialog 是否为模态。true 时每个面板用 showModal() 呈现，获得原生 ::backdrop、原生焦点圈定、整个流程共享的一个 body 滚动锁定，以及活动 BottomSheet 为 purpose='info' 时的点击关闭；同一时刻只绘制一个背景。false 时用 show()，无背景，页面保持可交互；避免经过 transform、containment 或裁剪的祖先元素，因为非模态 dialog 留在其包含上下文中。",
      default: 'true',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '由唯一 sheetId 标识的 BottomSheet。',
      required: true,
    },
  ],
  usage: {
    anatomy,
    description:
      '已弃用：请把每个步骤写成独立的 BottomSheet 并用 isOpen 控制，由一个状态值命名打开的步骤。在同一次更新中从打开步骤内的控件关闭顶层面板并打开下一步，会执行同样的替换衔接（见 BottomSheet 的 "替换面板"），无需 sheetId 也无需切换器；由流程外的控件（页面控件，或焦点离开步骤后的代码）改变步骤时，以普通的推入弹出动作关闭和打开。BottomSheetSwitcher 在未来 minor 版本移除前保持可用：独立使用的流程行为与发布版一致（含三处修复：步骤内弹出的 toast 渲染在流程上方且可点击；减弱动效下步骤遵循减弱动效规则；带 hasAutoFocus 字段的步骤在所有浏览器中都在该字段上打开），与其他面板堆叠的流程是堆叠中的一层（被覆盖时后退并被阻挡，共享唯一遮罩，被覆盖期间退出关闭竞争）。模态与 hasScrim={false} 流程以同样方式迁移。将 activeSheet 设为嵌套 BottomSheet 的 sheetId 以打开或切换步骤，设为 null 关闭。\n\n堆叠。带遮罩流程是打开面板堆叠中的一层（见 BottomSheet 的 "堆叠"）。在独立面板打开时打开流程，流程位于该面板之上，面板后退并被阻挡；流程打开时打开独立面板——从步骤内容或任何其他位置——该面板位于顶层，整个流程作为一体后退。就地切换步骤从不改变流程的位置。Escape、遮罩、滑动与平台关闭请求只到达顶层：流程在顶层时触发流程的 onActiveSheetChange(null)，独立面板在顶层时触发其 onOpenChange(false)。渲染在步骤内容中的独立面板只在该步骤活动时呈现：流程切换步骤或关闭时它随之离开，isOpen 仍归你；步骤返回时若它仍打开，则以顶层再次呈现。只有最底层的背景使页面变暗。无遮罩流程置身堆叠之外。',
    bestPractices: [
      {
        guidance: true,
        description:
          '优先为每个步骤使用独立 BottomSheet，配一个命名打开步骤的状态值；替换衔接完全相同，且无需把任何东西嵌套进切换器。',
      },
      {
        guidance: true,
        description:
          '就地迁移现有流程：用一个步骤值替换 activeSheet / onActiveSheetChange，为每个步骤提供 isOpen={step === id} 和带守卫的 onOpenChange（仅当它仍是打开步骤时才清空）以取代 sheetId，移除包装组件并把 hasScrim 挪到每个步骤上。映射切换器的其他 props：onCancel 变为每步带守卫的 onOpenChange（流程必须保持打开时忽略 false）——独立面板把 Escape、平台关闭、遮罩点击与滑动一律上报为无理由的 onOpenChange(false)，守卫生效期间对它们全部适用，而单独否决 Escape 没有对应物；按路径控制的唯一杠杆是 purpose（form 保留 Escape 并阻止遮罩点击与滑动；required 阻止全部三种并把步骤暴露为 alertdialog）。使用方的 aria-label 或 aria-labelledby 变为每步的 label，它为步骤 dialog 命名。ref、id、data-testid、className、style、xstyle 及其他 dialog props 没有 dialog 级对应物：独立面板把 ref 与基础 props 给到面板 div，其 dialog 属于实现细节，需要 dialog 的测试或锚点可查询面板的 closest("dialog")，dialog 级样式则被舍弃。',
      },
      {
        guidance: false,
        description:
          '不要在人们需要对比时把信息拆到多个面板；改用让相关内容同屏可见的整页布局。',
      },
      {
        guidance: false,
        description:
          '不要在多个面板需要同时可交互或可见时使用步骤流程；流程有意只选一个可交互步骤。',
      },
    ],
  },
  examples: [
    {
      label: '替换方案：与独立面板等效的三步流程',
      code: `const [step, setStep] = useState(null);

<>
  <Button label="Start" onClick={() => setStep('details')} />
  <BottomSheet isOpen={step === 'details'} onOpenChange={o => !o && setStep(c => (c === 'details' ? null : c))} label="Details" height="hug">
    <SetupDetails />
    <Button label="Continue" onClick={() => setStep('preferences')} />
  </BottomSheet>
  <BottomSheet isOpen={step === 'preferences'} onOpenChange={o => !o && setStep(c => (c === 'preferences' ? null : c))} label="Preferences" height="hug">
    <Preferences />
    <Button label="Back" onClick={() => setStep('details')} />
    <Button label="Continue" onClick={() => setStep('confirm')} />
  </BottomSheet>
  <BottomSheet isOpen={step === 'confirm'} onOpenChange={o => !o && setStep(c => (c === 'confirm' ? null : c))} label="Confirm" height="hug">
    <Confirmation />
    <Button label="Back" onClick={() => setStep('preferences')} />
    <Button label="Done" onClick={() => setStep(null)} />
  </BottomSheet>
</>`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '已弃用：每步用一个独立 BottomSheet 配一个命名打开步骤的状态值（从打开步骤内部切换时替换衔接相同，无需 sheetId）；在未来 minor 版本移除前保持可用。互斥多步 BottomSheet 的控制器，每个面板一个原生 dialog；带遮罩流程是底部面板堆叠的一层（按打开顺序堆叠于独立面板之上或之下，整体后退，切换步骤不改变位置）',
  usage: {
    anatomy,
    description:
      '已弃用：把每个步骤写成独立 BottomSheet，用 isOpen 由一个状态值驱动；同更新中从打开步骤内部关一开一是同样的替换衔接。仍然可用：将 activeSheet 设为嵌套 BottomSheet 的 sheetId 以打开或切换步骤，设为 null 关闭。带遮罩流程与独立面板作为一层堆叠；步骤内的独立面板在离开步骤时退出，仍打开时随步骤返回。',
    bestPractices: [
      {
        guidance: true,
        description:
          '优先为每个步骤使用独立 BottomSheet，配一个命名打开步骤的状态值；替换衔接完全相同，且无需把任何东西嵌套进切换器。',
      },
      {
        guidance: true,
        description:
          '就地迁移现有流程：用一个步骤值替换 activeSheet / onActiveSheetChange，为每个步骤提供 isOpen={step === id} 和带守卫的 onOpenChange（仅当它仍是打开步骤时才清空）以取代 sheetId，移除包装组件并把 hasScrim 挪到每个步骤上。映射切换器的其他 props：onCancel 变为每步带守卫的 onOpenChange（流程必须保持打开时忽略 false）——独立面板把 Escape、平台关闭、遮罩点击与滑动一律上报为无理由的 onOpenChange(false)，守卫生效期间对它们全部适用，而单独否决 Escape 没有对应物；按路径控制的唯一杠杆是 purpose（form 保留 Escape 并阻止遮罩点击与滑动；required 阻止全部三种并把步骤暴露为 alertdialog）。使用方的 aria-label 或 aria-labelledby 变为每步的 label，它为步骤 dialog 命名。ref、id、data-testid、className、style、xstyle 及其他 dialog props 没有 dialog 级对应物：独立面板把 ref 与基础 props 给到面板 div，其 dialog 属于实现细节，需要 dialog 的测试或锚点可查询面板的 closest("dialog")，dialog 级样式则被舍弃。',
      },
      {
        guidance: false,
        description:
          '不要在人们需要对比时把信息拆到多个面板；改用让相关内容同屏可见的整页布局。',
      },
      {
        guidance: false,
        description:
          '不要在多个面板需要同时可交互或可见时使用步骤流程；流程有意只选一个可交互步骤。',
      },
    ],
  },
};
