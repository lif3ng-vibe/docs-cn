// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheet.doc.mjs
 * @input BottomSheet props, sheet anatomy, and focus-time keyboard scrolling behavior
 * @output Consumer documentation and examples for BottomSheet
 * @position CLI and rendered component documentation
 */

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Sheet panel',
    required: true,
    description:
      '从底部边缘升起并承载面板内容的着色表面。',
  },
  {
    name: 'Content area',
    required: true,
    description:
      '带内边距的可滚动容器，呈现调用方提供的面板内容。',
  },
  {
    name: 'Handle',
    required: true,
    description:
      '面板顶部的装饰性抓握标识与拖拽区域。',
  },
  {
    name: 'Scrim',
    required: false,
    description:
      '遮罩呈现方式下使页面变暗并阻挡其交互的背景层。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'BottomSheet',
  displayName: 'Bottom Sheet',
  group: 'BottomSheet',
  category: 'Overlay',
  keywords: [
    '底部面板',
    '面板',
    '移动端',
    '触摸',
    '拖拽',
    '滑动',
    '吸附点',
    '档位',
    '调整大小',
    '关闭',
    '抓握手柄',
    '对话框',
    '浮层',
    '模态',
    '表单',
    '移动端键盘',
    '可视视口',
  ],
  playground: {
    overlay: true,
    defaults: {
      isOpen: false,
      label: '筛选',
      height: 'hug',
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
              children: '筛选',
            },
            {
              __element: 'Text',
              props: {type: 'body'},
              children: '调整下方属性，然后打开预览。',
            },
          ],
        },
      },
    },
  },
  theming: {
    container: true,
    targets: [{className: 'astryx-bottom-sheet', visualProps: []}],
    derived: [{property: 'padding', expand: 'container'}],
  },
  description:
    '从底部边缘升起的移动端触摸面板，带出入场动画、抓握手柄、可选的拖拽调整大小吸附点，以及按用途控制的关闭行为。与 Dialog 一样，它是带内边距的容器：内容从主题的 bottom-sheet 内边距开始（默认 --spacing-4），单独的 Section 子元素或 Table、Divider 等出血子元素会相对它对齐。在顶部，内容始终从抓握条的 24px 区域下方开始，子元素无法通过内边距逃逸该区域，因此第一行绝不会位于抓握条之下；滚动内容会从其下方穿过。面板始终拥有原生 <dialog>；在已弃用的 BottomSheetSwitcher 内部，由切换器在流程步骤间切换时呈现和关闭该 dialog。两种模式下，ref 与共享 DOM props 都作用于可见的 <div> 面板。面板可堆叠：在一个面板打开时再打开另一个，新面板位于其上，被覆盖面板保持挂载并后退，页面上只有一层遮罩。同一更新中一个面板关闭、另一个打开时是替换关系，提供多步流程所需的步骤衔接。',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        '独立面板是否打开。完全受控；与 onOpenChange 搭配使用。仅在已弃用的 BottomSheetSwitcher 内部省略，由它自行驱动各步骤。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        '对独立面板，在其请求改变打开状态时调用。自动调用遵循 purpose：info 在按 Escape、点击遮罩或滑动时关闭；form 仅在按 Escape 时关闭；required 不会隐式关闭。仅在已弃用的 BottomSheetSwitcher 内部省略，由它自行驱动各步骤。',
    },
    {
      name: 'finalFocusRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        '独立面板可选的显式焦点返回目标。当打开者可能重新挂载、或当前活动元素不是可靠的触发器（如自适应呈现切换）时使用。面板自行关闭或最后关闭时始终聚焦该元素；当下方仍有模态面板打开时，焦点返回到该面板内（若此元素在其内部则聚焦它，否则聚焦显现的面板）。仅在已弃用的 BottomSheetSwitcher 内部省略，由它自行驱动各步骤。',
    },
    {
      name: 'purpose',
      type: "'required' | 'form' | 'info'",
      description:
        "控制隐式关闭行为，与 Dialog 一致。info 允许按 Escape、点击遮罩和滑动关闭。form 阻止点击遮罩与滑动以保护已输入数据，同时保留 Escape。required 阻止所有隐式关闭路径，并使用 role='alertdialog'。显式控件仍可更新受控状态。适用于独立面板与 BottomSheetSwitcher 管理的面板。",
      default: "'info'",
    },
    {
      name: 'sheetId',
      type: 'string',
      description:
        '随 BottomSheetSwitcher 一起弃用：请改为用 isOpen 为每个步骤提供独立面板。发布时的行为仍然有效：面板在 BottomSheetSwitcher 内的唯一 ID，activeSheet 匹配时打开；使用 sheetId 时省略 isOpen 与 onOpenChange。',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '面板的无障碍标签。必填；面板没有可用于派生名称的内置标题。',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        "可滚动区域中的面板内容。内容体在溢出时仍可通过键盘到达。正向 Tab 进入可能直接跳到第一个原生链接或按钮；输入控件、组合部件与嵌套滚动区域会保留内容体停靠点。从委托的第一个子元素按 Shift+Tab 会跳过内容体。内容完整容纳时不添加内容体停靠点。内部观察的内容盒保持块向流与百分比高度。若内容包含会唤起移动端键盘的文本输入控件，请使用 height='tall' 并在编辑时保持面板完全展开。",
      required: true,
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '面板内容的内边距，使用间距刻度，与 Dialog 一致。省略时使用主题的 bottom-sheet 默认值（主题未在 bottom-sheet 上设置 padding 时为 --spacing-4）。单独的 Section 子元素会逃逸内边距，Table、Divider 等出血子元素会相对它补偿。内容自带头部内缩（edge-to-edge）时使用 0。无论内边距多少，块起始侧内缩绝不小于抓握条高度（--spacing-6），静止内容从抓握条下方开始。',
    },
    {
      name: 'height',
      type: "'hug' | 'capped' | 'tall' | number | string",
      description:
        "面板的高度。命名高度档：'hug' 随内容自适应，最高至视口的 92%；'capped' 是可滚动的中等高度面板（约 62%）；'tall' 是固定的近全高面板（约 92%），适合流式载入的内容。也可传数字（px）或 CSS 长度自定义高度。配置 snapPoints 让用户在多个高度间拖拽。较矮的视口上面板会填满可用高度。只有完全展开的 'tall' 面板提供移动端键盘适配：面板保持原位，把每个聚焦控件滚动到键盘上方。hug、capped、数字与 CSS 长度高度从不如此；tall 面板在用户拖到更低档位的瞬间停止适配，拖回后恢复。在该状态之外，面板既不移动也不增加键盘滚动空间，浏览器的原生聚焦露出保持原样；在 iOS 上这种露出可能推移整个页面。该适配适用于可视视口因键盘而收缩的环境，如 iOS Safari、Android 版 Firefox 与 Chrome：键盘升起时面板把聚焦控件放在键盘正上方，控件随 Gboard 剩余的上滑一起移动，失焦后随下滑一起回落；Chrome 延迟上报的隐藏（如按 Back）则按 Chrome 的上报时机回落（`astryx docs browser-support`）。",
      default: "'capped'",
    },
    {
      name: 'snapPoints',
      type: 'ReadonlyArray<number | string>',
      description:
        "面板拖拽后可停驻的额外高度；自身高度始终是最高档位，省略该项则面板只能打开和关闭。每个档位是面板的可见高度：数字是视口比例（0.5 为半屏），'50%' 是等价的 CSS 写法，'320px' 是绝对长度。小于等于面板四分之一的档位是窥视（peek）：它滑出而非重排，并减淡遮罩。",
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description:
        "对独立 BottomSheet，是否渲染遮罩——覆盖并阻挡背景的半透明浮层。true（默认）使用 showModal()：顶层、原生焦点圈定、::backdrop 遮罩、body 滚动锁定，以及 purpose='info' 时的点击遮罩关闭，背景变为 inert。带遮罩的面板参与堆叠（见下文堆叠一节）。false 时面板以手动 popover 形式呈现在顶层（低于 Popover API 支持下限时以 show() 按页面堆叠顺序作为降级）——无遮罩、无焦点陷阱、无滚动锁定，背后的页面保持可交互、可滚动；无遮罩面板不参与堆叠也不能被堆叠，但无遮罩步骤之间仍以同样的衔接方式相互替换。当某个不包含它的模态（带遮罩面板或 Dialog）打开时展示无遮罩面板，它在该模态下呈 inert 并保持在其下方（show()，无页面级 z-index），直到该模态消失后再进入顶层；退出中的模态视为已消失，渲染在模态内部的面板则立即进入顶层。多步流程中，每个步骤的 hasScrim 应保持一致。",
      default: 'true',
    },
  ],
  usage: {
    anatomy,
    description:
      '用于筛选、操作、表单与详情视图的移动端触摸表面，从视口底部升起。多步流程中，为每个步骤提供独立面板，并用一个状态值命名当前打开的步骤（见 "替换面板"）；当某步骤需要在下方保持可见时，在第一个面板之上打开第二个面板。\n\n堆叠。每个面板保留自己的 isOpen。在另一个带遮罩的面板打开时再打开一个面板，它会堆叠在其上：下方面板保持挂载，滚动位置与输入得以保留，后退到新面板之后（最近的被覆盖面板缩小到 0.96 并上移 8px，更深的缩小到 0.92 并上移 16px），并被顶层面板的模态 dialog 阻挡指针、键盘与辅助技术。面板可以是兄弟节点、位于不同组件中、放在另一个面板的内容里，或放在 BottomSheetSwitcher 的某个步骤中；整个切换器算一层，就地切换步骤不改变其位置。DOM 中没有任何移动：每个面板的 dialog 停留在原处，也不需要包裹组件。\n\n顺序即打开顺序。顶层面板是最近打开且仍打开的面板；关闭后重新打开的面板回到顶层。多个面板在同一次更新中打开（深链进入流程）时，它们之间没有打开顺序，由树顺序决定：面板位于其内容中渲染的面板之下，兄弟面板按书写顺序排列。该顺序在首帧绘制时即正确。\n\n单一遮罩。只有最底层面板的背景使页面变暗；其上各面板的背景是透明的，堆叠不会随层数加深变暗。面板推入弹出时暗度保持稳定；若最底层面板关闭而上方仍有面板，下一层面板的背景在同一帧内接管。\n\n关闭。Escape、点击遮罩、下滑以及平台关闭请求（Android 返回键、close watcher）只到达顶层面板，经由该面板自己的 onOpenChange，且该面板的 purpose 生效：required 阻止所有方式，form 阻止遮罩与滑动。没有任何操作会一次关闭整个堆叠；流程结束时在同一次更新中把所有面板置为关闭，它们一起退出。\n\n从代码关闭被覆盖的面板。渲染在关闭面板内容中的面板是其一部分：只在它打开时呈现，并随它一起退出。它们的 isOpen 仍归你管理，如同渲染在已关闭 Dialog 中的 Dialog：不会向其写入任何东西；宿主重新打开时仍处于打开状态的嵌套面板会再次呈现，位于顶层。流程结束时请自行将其置为关闭。不在关闭面板内容中、位于其上方的面板保持打开并维持顺序；关闭的面板从其下方滑出，若遮罩归它所有，则由上方面板接管。\n\n替换面板。在同一次更新中关闭顶层面板并打开另一个（用一个状态值命名打开的步骤即是如此），新面板会替换它而不是堆叠在其上：新面板在被替换面板上方升起；若被替换面板更高，它会同时下移，使其顶边与新面板顶边相接；被替换面板在两个动作都结束后才淡出，并且从一开始就是 inert 且对辅助技术隐藏。遮罩全程稳定，无回淡；焦点移入新面板；流程关闭时，焦点返回到打开其第一个面板的元素，无论最后关闭的是哪个面板。这就是已弃用的 BottomSheetSwitcher 在步骤间执行的衔接；多步流程无需切换器：为每个步骤提供独立的 BottomSheet 和一个状态值。只有当同一次更新中恰好一个面板关闭、一个打开，关闭的面板是其堆叠的顶层，且该操作来自其内部（最近按下的控件，或近期无按压时的聚焦元素，位于关闭的面板中——步骤自身的 Continue 或 Back 按钮正是如此）时，才发生替换；面板打开的同时被覆盖面板关闭、关闭与打开发生在不同更新中，或关闭与打开由关闭面板之外的控件驱动（两个不相关的属主同时操作）时，保持普通的推入弹出动作与各自的焦点返回。在已打开堆叠之上的替换上移一层，其下的面板保持被覆盖。非模态面板（hasScrim={false}）以同样方式相互替换，只是没有遮罩：它们以手动 popover 形式驻留在浏览器顶层，进入的步骤以 DOM 顺序排在保留步骤之上而无需页面级 z-index，面板打开前或打开期间弹出的 toast 保持在其上方。低于 Popover API 支持下限时（浏览器支持指南中的 Tier 2），面板回退为按页面堆叠顺序的 show()：可用，但对之后出现的页面内容没有保证。非模态面板关闭时只有焦点仍在其中才把焦点交还打开者；焦点已被页面其他位置取走时保持原地。\n\n焦点。无论是否模态，打开面板时都会在各浏览器中聚焦其 data-autofocus 字段（带 hasAutoFocus 的 TextInput）。没有该字段时，焦点落在引擎原生 dialog 聚焦步骤的结果上：Chromium 中是面板本身，Firefox 中是第一个可聚焦控件。作为替换进入的步骤也会先聚焦某个 data-autofocus 后代，因此从字段开始的流程能保持键盘在该字段上。关闭顶层面板时，焦点返回它显露的面板：打开它的控件还在时回到该控件，否则回到显露面板的面板体。最后一个面板关闭时，适用独立面板规则：finalFocusRef，否则是打开面板的元素，且仅在键盘输入后才显示焦点环。堆叠中的所有面板在同一次更新中关闭时，焦点只返回一次，交给最底层面板的 finalFocusRef 或打开者，在最后一个 dialog 关闭之后。\n\n注意事项。从面板打开的 Dialog、AlertDialog 或 Popover 绘制在面板上方，且不会使其后退；从该 Dialog 内部打开的面板绘制在 Dialog 上方，并堆叠于下方面板之上。hasScrim={false} 的面板完全置身堆叠之外（它们相互替换，但绝不堆叠、后退或接管遮罩）。被 React 隐藏的面板（挂起的 Suspense 边界、Activity mode="hidden"）会退出堆叠并关闭其 dialog；再次显示时重新呈现，位于顶层。只有渲染在同一文档中的面板才会堆叠；iframe 内的面板是独立的堆叠。',
    bestPractices: [
      {
        guidance: true,
        description:
          '适用于内容应从底部边缘升起的移动优先场景（筛选、分享面板、快捷操作）。',
      },
      {
        guidance: true,
        description:
          '逐层深入时，在当前面板之上打开下一个面板，并把每个面板的 isOpen 放在其数据所在处；详情面板可以就放在打开它的列表面板内、紧挨着那一行。在同一次更新中关闭所有面板以结束整个流程。',
      },
      {
        guidance: true,
        description:
          "选择与内容匹配的初始高度：短且有边界的内容用 'hug'，列表用 'capped'，表单或流式/变尺寸内容用 'tall'。",
      },
      {
        guidance: true,
        description:
          "用 purpose='form' 阻止点击遮罩与滑动破坏已输入数据，同时保留 Escape；purpose='required' 留给必须以显式操作结束的流程。",
      },
      {
        guidance: false,
        description:
          '不要让面板内容过长。拆分为多个步骤，每个步骤一个面板，用一个状态值命名打开的步骤；继续时由下一步替换当前步。',
      },
      {
        guidance: false,
        description:
          '堆叠不要超过两三层：更深层共享第二级后退样式，用户只能逐层关闭。步骤无需保持可见时，改用替换（一次更新中关一开一）。',
      },
    ],
  },
  examples: [
    {
      label: '基础',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Filters">
  <FilterControls />
</BottomSheet>`,
    },
    {
      label: '高面板（列表）',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Nearby places"
  height="tall">
  <PlaceList />
</BottomSheet>`,
    },
    {
      label: '可折叠至半屏',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Nearby places"
  height="tall"
  snapPoints={[0.5]}>
  <PlaceList />
</BottomSheet>`,
    },
    {
      label: '窥视高度、工作高度与全高',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Route"
  height="tall"
  snapPoints={['96px', '50%']}>
  <RouteDetails />
</BottomSheet>`,
    },
    {
      label: '自适应高度（随内容）',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Share"
  height="hug">
  <ShareActions />
</BottomSheet>`,
    },
    {
      label: '长滚动内容',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Release notes"
  height="hug">
  <ReleaseNotes />
</BottomSheet>`,
    },
    {
      label:
        '多步流程（一次一个面板，每步替换上一步）',
      code: `// One value names the open step. Moving on closes one sheet and opens the
// next in the same update: the next step rises above the current one, which
// fades once it has arrived. A dismissed step closes the flow.
const [step, setStep] = useState(null);
const stepProps = own => ({
  isOpen: step === own,
  onOpenChange: isOpen => !isOpen && setStep(current => (current === own ? null : current)),
});
<>
  <Button label="Start" onClick={() => setStep('details')} />
  <BottomSheet {...stepProps('details')} label="Details">
    <Button label="Continue" onClick={() => setStep('confirm')} />
  </BottomSheet>
  <BottomSheet {...stepProps('confirm')} label="Confirm">
    <Button label="Back" onClick={() => setStep('details')} />
    <Button label="Done" onClick={() => setStep(null)} />
  </BottomSheet>
</>`,
    },
    {
      label: '堆叠面板（逐层深入：列表、订单、编辑）',
      code: `const [isListOpen, setIsListOpen] = useState(false);
const [orderId, setOrderId] = useState(null);
const [isEditing, setIsEditing] = useState(false);
const closeAll = () => {
  setIsListOpen(false);
  setOrderId(null);
  setIsEditing(false);
};
<>
  <Button label="Orders" onClick={() => setIsListOpen(true)} />
  <BottomSheet isOpen={isListOpen} onOpenChange={setIsListOpen} label="Orders">
    {orders.map(order => (
      <Button key={order.id} label={order.title} onClick={() => setOrderId(order.id)} />
    ))}
  </BottomSheet>
  {/* Opens over the list; the list recedes and stays mounted. */}
  <BottomSheet
    isOpen={orderId != null}
    onOpenChange={open => !open && setOrderId(null)}
    label="Order">
    <Button label="Edit" onClick={() => setIsEditing(true)} />
    <Button label="Close all" onClick={closeAll} />
  </BottomSheet>
  <BottomSheet isOpen={isEditing} onOpenChange={setIsEditing} label="Edit order">
    <Button label="Save" onClick={() => setIsEditing(false)} />
  </BottomSheet>
</>`,
    },
    {
      label: '打开它的列表面板内部的详情面板',
      code: `function PlaceRow({place}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button label={place.name} onClick={() => setIsOpen(true)} />
      {/* Rendered in the list sheet's content: stacks above it, leaves with it, and comes back with it while still open. */}
      <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label={place.name}>
        <PlaceDetail place={place} />
      </BottomSheet>
    </>
  );
}

<BottomSheet isOpen={isListOpen} onOpenChange={setIsListOpen} label="Places">
  {places.map(place => <PlaceRow key={place.id} place={place} />)}
</BottomSheet>`,
    },
    {
      label: '深链进入堆叠（一次更新打开多个面板）',
      code: `// From a URL: list, order and editor open together. With no open order
// between them, tree order decides: the list is at the bottom, the editor on top.
const [isListOpen, setIsListOpen] = useState(() => route.list);
const [orderId, setOrderId] = useState(() => route.orderId);
const [isEditing, setIsEditing] = useState(() => route.edit);
<>
  <BottomSheet isOpen={isListOpen} onOpenChange={setIsListOpen} label="Orders">…</BottomSheet>
  <BottomSheet isOpen={orderId != null} onOpenChange={open => !open && setOrderId(null)} label="Order">…</BottomSheet>
  <BottomSheet isOpen={isEditing} onOpenChange={setIsEditing} label="Edit order">…</BottomSheet>
</>`,
    },
    {
      label: '移动端键盘',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Add a comment"
  height="tall">
  <LongCommentForm />
</BottomSheet>`,
    },
    {
      label: '无遮罩',
      code: `const [isOpen, setIsOpen] = useState(true);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Nearby places"
  hasScrim={false}>
  <PlaceList />
</BottomSheet>`,
    },
    {
      label: '保护表单输入',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  purpose="form"
  label="Edit profile">
  <ProfileForm onSave={() => setIsOpen(false)} />
</BottomSheet>`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '从底部边缘升起的移动端触摸面板（原生 <dialog>）：抓握手柄、可选的基于 transform 的拖拽调高吸附点（snapPoints：视口比例、百分比或 px 长度）、释放时滚动区域调整为停驻可见高度（窥视档位不超过面板四分之一，保持全高改为滑出）、与 Dialog 对齐的关闭用途（info/form/required）、按用途启用的滑动关闭、完全展开 tall 的可视视口移动端键盘处理、命名高度档、类 Dialog 的容器内边距（padding prop、主题 bottom-sheet padding、默认 --spacing-4）、模态（默认）或非模态（hasScrim={false}）呈现；模态面板按打开顺序堆叠（被覆盖面板保持挂载，先后退 0.96/−8px 再 0.92/−16px，并被阻挡；单一遮罩；同更新打开按树排序；Escape/遮罩/滑动只弹出顶层；关闭面板内容中的面板随其退出，仍打开时随宿主返回）',
  usage: {
    anatomy,
    description:
      '用于筛选、操作、表单与详情视图的移动端触摸表面，从视口底部升起；多步流程为每步提供独立面板，用一个状态值命名打开的步骤：同更新的关一开一是替换衔接（进入面板在上，保留面板对齐后淡出，遮罩稳定不变，流程关闭时焦点交还流程打开者）。在另一面板之上打开面板即堆叠：各面板保留自己的 isOpen，顶层是最近打开者，被覆盖面板后退并被阻挡，一层遮罩使页面变暗，关闭只弹出顶层。渲染在关闭面板内容中的面板随其退出（isOpen 仍归你；仍打开时随宿主返回）；其上方兄弟面板保持打开。',
    bestPractices: [
      {
        guidance: true,
        description:
          '适用于内容应从底部边缘升起的移动优先场景（筛选、分享面板、快捷操作）。',
      },
      {
        guidance: true,
        description:
          "选择与内容匹配的初始高度：短且有边界的内容用 'hug'，列表用 'capped'，表单或流式/变尺寸内容用 'tall'。",
      },
      {
        guidance: true,
        description:
          "用 purpose='form' 阻止点击遮罩与滑动破坏已输入数据，同时保留 Escape；purpose='required' 留给必须以显式操作结束的流程。",
      },
      {
        guidance: false,
        description:
          '不要让面板内容过长。拆分为多个步骤，每个步骤一个面板，用一个状态值命名打开的步骤；继续时由下一步替换当前步。',
      },
      {
        guidance: false,
        description:
          '堆叠不要超过两三层；步骤无需保持可见时用替换（一次更新中关一开一）。',
      },
    ],
  },
};
