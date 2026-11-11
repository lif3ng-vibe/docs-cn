// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TransferList.doc.mjs
 * @input TransferListSelector and TransferList public APIs, commit behavior, and usage guidance
 * @output Documents the default-immediate selector, optional staged commits, and advanced TransferList composition
 * @position Lab documentation consumed by component tooling
 *
 * SYNC: When modified, update TransferListSelector.tsx, TransferList.tsx, commit-behavior tests, and package exports.
 */

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TransferListSelector',
  displayName: 'Transfer List Selector',
  group: 'Selector',
  category: 'Form Controls',
  keywords: [
    'transfer list',
    '穿梭框',
    'dual list',
    '双列表',
    'pick list',
    '选择列表',
    'selector',
    '选择器',
    'popover',
    'selection',
    '选择',
    'reorder',
    '重新排序',
    'columns',
    '列',
    'available',
    '可选',
    'selected',
    '已选',
    'immediate',
    '即时提交',
    'draft',
    '草稿',
    'apply',
    '应用',
    'TransferListSelector',
  ],
  description:
    '在已选列表与可选列表之间移动选项的选择器字段，并可选地对已选值排序。默认即时提交变更；分阶段提交行为增加内部草稿和 Apply/Cancel 底栏。TransferList 仍是供自定义 ComplexSelector 表面使用的底层内容原语。',
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '显示在 popover 外部的无障碍字段标签，除非 isLabelHidden 为 true。',
      required: true,
    },
    {
      name: 'options',
      type: 'readonly TransferListOption<T>[]',
      description:
        '完整的选项池。每个选项有 value 和 label，可选可搜索的 description 元数据、group、isTransferDisabled 约束和 disabledMessage。哪些选项保持原位由 reorderable 对象的 isReorderable 决定。',
      required: true,
    },
    {
      name: 'value',
      type: 'readonly T[]',
      description:
        '按显示顺序排列的已提交选中值。分阶段行为中，它是选择器打开时复制到本地草稿的已应用值。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(nextValue: readonly T[]) => void',
      description:
        '即时行为中每次允许的列表编辑后调用；分阶段行为中 Apply 提交了有变更的草稿时调用一次。',
      required: true,
    },
    {
      name: 'commitBehavior',
      type: 'TransferListSelectorCommitBehavior',
      description:
        '控制变更何时提交。immediate 在每次列表编辑时更新，无底栏；staged 等待 Apply，支持 Cancel 或轻拂关闭。',
      default: "'immediate'",
    },
    {
      name: 'triggerLabel',
      type: 'ReactNode',
      description: '收起状态选择器触发器中显示的内容。',
      default: '`${value.length} selected`',
    },
    {
      name: 'description',
      type: 'string',
      description: '随外部标签显示的字段辅助说明。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '在视觉上隐藏字段标签，同时保留其无障碍名称。',
      default: 'false',
    },
    {
      name: 'selectedLabel',
      type: 'string',
      description: '已选列表的标题与无障碍名称。',
      default: "'Selected'",
    },
    {
      name: 'availableLabel',
      type: 'string',
      description: '可选列表的标题与无障碍名称。',
      default: "'Available'",
    },
    {
      name: 'hasSearch',
      type: 'boolean',
      description:
        '显示共享搜索框，按标签和描述过滤两个列表。',
      default: 'false',
    },
    {
      name: 'searchLabel',
      type: 'string',
      description: '共享搜索框的无障碍标签。',
      default: "'Search ' followed by label",
    },
    {
      name: 'searchPlaceholder',
      type: 'string',
      description: '共享搜索框中显示的占位符。',
      default: "'Search...'",
    },
    {
      name: 'reorderable',
      type: 'Reorderable<T>',
      description:
        '让已选选项可重新排序：传入 createReorderable 创建的对象。每行已选行末尾带一个重排手柄：触摸屏上按住手柄片刻再拖动；鼠标立即拖动；在手柄上轻点、单击、按 Space 或 Enter 会为该行开启重排模式，模式中每次方向键（或手柄下方提示中的每次移动）把它移动一格，Escape、Done 或再次激活结束模式并保留移动。对象的 isReorderable(value) 决定哪些值可移动：被拒绝的值没有手柄，且在已选列表两端它也阻止其他值越过它。即时行为中每次移动传给对象的 onReorder({key, to})；分阶段行为中选择器改为移动其草稿，因此 Cancel 连同草稿一起丢弃移动，Apply 经 onChange 提交。搜索过滤面板时重排暂停。未提供时，已选选项保持原有顺序。',
    },
    {
      name: 'hasSelectAll',
      type: 'boolean',
      description:
        '显示 Add all，把所有允许转移的可选选项加入当前选择。',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        '显示 Clear，把所有允许转移的已选选项从当前选择中移除。',
      default: 'false',
    },
    {
      name: 'renderOption',
      type: '(option: TransferListOption<T>) => ReactNode',
      description:
        '自定义行内容，同时保留内置标签、操作、约束和重排交互。',
    },
    {
      name: 'selectedEmptyText',
      type: 'string',
      description: '已选列表为空时显示的消息。',
      default: "'No selected options'",
    },
    {
      name: 'availableEmptyText',
      type: 'string',
      description: '所有选项都已选时显示的消息。',
      default: "'No available options'",
    },
    {
      name: 'noResultsText',
      type: 'string',
      description: '搜索在列表中无匹配时显示的消息。',
      default: "'No results'",
    },
    {
      name: 'applyLabel',
      type: 'string',
      description:
        '分阶段 Apply 操作的标签。仅在 commitBehavior="staged" 时有效。',
      default: "'Apply'",
    },
    {
      name: 'cancelLabel',
      type: 'string',
      description:
        '分阶段 Cancel 操作的标签。仅在 commitBehavior="staged" 时有效。',
      default: "'Cancel'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '触发器与字段尺寸。',
      default: "'md'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段及其弹出层的宽度；两者都跟随这一个值。',
      default: "'min(41rem, calc(100vw - 32px))'",
    },
    {
      name: 'placement',
      type: "'above' | 'below' | 'start' | 'end'",
      description: 'Popover 相对触发器的放置位置。',
      default: "'below'",
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '标记字段为可选。',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '标记字段为必填。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用选择器触发器和转移交互。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '在触发器上显示加载状态，忙碌期间禁用转移交互。',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description: '字段的校验状态。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description: '状态消息的放置处理方式。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '显示在字段标签旁边的工具提示文字。',
    },
    {
      name: 'changeAction',
      type: '(value: readonly T[]) => void | Promise<void>',
      description:
        '可选的异步操作，在每次即时提交或有变更的分阶段 Apply 后运行；驱动乐观更新和忙碌状态。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '外部选择器带边框控件盒的 StyleX 样式。',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description: '应用到外部选择器控件盒的 class 名。',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description:
        '应用到外部选择器控件盒的内联样式。',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: '选择器触发器按钮的测试 ID。',
    },
  ],
  components: [
    {
      name: 'TransferList',
      displayName: 'Transfer List',
      description:
        '供高级选择器组合使用的底层受控内容原语，可添加自定义头部、保存的视图、预设或操作。变更即时作用于其受控 value。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '完整转移控件的无障碍名称。',
          required: true,
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description:
            '在视觉上隐藏控件标签，同时保留其无障碍名称。',
          default: 'false',
        },
        {
          name: 'description',
          type: 'string',
          description: '显示在控件标签下方的辅助说明。',
        },
        {
          name: 'options',
          type: 'readonly TransferListOption<T>[]',
          description:
            '完整的选项池，带可选元数据、分组、转移约束和重排约束。',
          required: true,
        },
        {
          name: 'value',
          type: 'readonly T[]',
          description: '按显示顺序排列的选中选项值。',
          required: true,
        },
        {
          name: 'onChange',
          type: '(nextValue: readonly T[]) => void',
          description:
            '允许的选项被添加、移除或批量变更后立即调用。移动则改为传给 reorderable 对象的 onReorder。',
          required: true,
        },
        {
          name: 'selectedLabel',
          type: 'string',
          description: '已选列表的标题与无障碍名称。',
          default: "'Selected'",
        },
        {
          name: 'availableLabel',
          type: 'string',
          description: '可选列表的标题与无障碍名称。',
          default: "'Available'",
        },
        {
          name: 'hasSearch',
          type: 'boolean',
          description:
            '显示共享搜索框，按标签和描述过滤两个列表。',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            '禁用所有转移、重排、Clear、Add all 和搜索控件。行控件和搜索框保持可聚焦。',
          default: 'false',
        },
        {
          name: 'searchLabel',
          type: 'string',
          description: '共享搜索框的无障碍标签。',
        },
        {
          name: 'searchPlaceholder',
          type: 'string',
          description: '共享搜索框中显示的占位符。',
          default: "'Search...'",
        },
        {
          name: 'reorderable',
          type: 'Reorderable<T>',
          description:
            '通过每行末尾的手柄让已选选项可重新排序：传入 createReorderable 创建的对象。其 isReorderable(value) 决定哪些选项可移动（在列表两端被它拒绝的选项也会阻止其他选项越过它），每次移动传给它的 onReorder({key, to})，to 是移动后该值在 value 中的索引。未提供时，已选选项保持原有顺序。',
        },
        {
          name: 'hasSelectAll',
          type: 'boolean',
          description: '为允许转移的可选选项显示 Add all。',
          default: 'false',
        },
        {
          name: 'hasClear',
          type: 'boolean',
          description:
            '为允许转移的已选选项显示 Clear；禁止转移的值保持选中。',
          default: 'false',
        },
        {
          name: 'renderOption',
          type: '(option: TransferListOption<T>) => ReactNode',
          description:
            '自定义行内容，不替换内置操作和约束。',
        },
        {
          name: 'selectedEmptyText',
          type: 'string',
          description: '已选列表为空时显示的消息。',
          default: "'No selected options'",
        },
        {
          name: 'availableEmptyText',
          type: 'string',
          description: '所有选项都已选时显示的消息。',
          default: "'No available options'",
        },
        {
          name: 'noResultsText',
          type: 'string',
          description: '搜索在列表中无匹配时显示的消息。',
          default: "'No results'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description: 'TransferList 根元素的 StyleX 样式。',
        },
      ],
    },
  ],
  usage: {
    description:
      '默认用 TransferListSelector 处理中到大型、可查看的集合，其中成员构成和选中顺序需要显式控制。即时行为每次编辑即提交，不渲染底栏。用户需要在 Apply 前审阅一组变更时选择分阶段行为。仅在刻意自定义的 ComplexSelector 表面中直接用 TransferList，例如带保存视图和自定义底栏的表格列设置。',
    bestPractices: [
      {
        guidance: true,
        description:
          '从即时行为开始。添加、移除和批量变更发生时即调用 onChange，移动调用 reorderable 对象的 onReorder，关闭或轻拂关闭 popover 会保留这些已提交的变更。',
      },
      {
        guidance: true,
        description:
          '当完整选择需要作为一个事务审阅或持久化时，设 commitBehavior="staged"。Apply 提交有变更的草稿；Cancel、Escape 和轻拂关闭丢弃草稿。',
      },
      {
        guidance: true,
        description:
          '仅当表面需要自定义结构（如保存的视图、预设、头部或底栏操作）时，才在 ComplexSelector 内直接用 TransferList。保持已应用状态与草稿状态分离，表面每次打开时重置草稿。',
      },
      {
        guidance: true,
        description:
          '独立使用 isTransferDisabled 和 reorderable 对象的 isReorderable：isTransferDisabled 把选项固定在其面板，isReorderable 让选项保持原位。转移不可用时提供 disabledMessage，让约束可被发现；保持原位的行不显示重排手柄，重要时在其内容中说明原因。',
      },
      {
        guidance: true,
        description:
          '不传 `reorderable` 时 TransferList 不再重排；请传 `reorderable={createReorderable(…)}`。从 isReorderable 迁移：改传 reorderable={createReorderable({onReorder, isReorderable})}。isReorderable prop 和每个选项的 isReorderDisabled 已移除；保持原位的选项由对象的 isReorderable(value) 返回 false 表达。',
      },
      {
        guidance: true,
        description:
          '行内容保持简洁单行。选项 description 用作可搜索元数据；确需更丰富的可见内容时用 renderOption。',
      },
      {
        guidance: true,
        description:
          '添加、移除和批量变更即时提交。拖动时各行保持静止：原行原地变暗，其副本跟随手指或指针，插入线标记落点；reorderable 对象的 onReorder 在松手时运行一次。',
      },
      {
        guidance: false,
        description:
          '不要把 commitBehavior 当作呈现或容器选择。两个值渲染同一个选择器 popover；要不同的外壳请用显式组合。',
      },
      {
        guidance: false,
        description:
          '不要用转移列表处理少量简单选择；CheckboxInput 或 MultiSelector 更紧凑。',
      },
    ],
    anatomy: [
      {
        name: 'Field label and description',
        required: true,
        description:
          '在 popover 外命名并说明选择器，使放置不随辅助文字变化。',
      },
      {
        name: 'Selector trigger',
        required: true,
        description:
          '汇总已提交值并打开转移列表 popover。',
      },
      {
        name: 'Search',
        required: false,
        description:
          '过滤已选和可选列表而不改变其值，统一使用 12px 内缩。',
      },
      {
        name: 'Selected and available sections',
        required: true,
        description:
          '把两个无边框语义列表放在一条分隔线两侧。窄容器将两个分区纵向堆叠，在每列标题后使用正文背景，把两个分区扩展到与其行同高，并把溢出交给一个可滚动的外层表面。',
      },
      {
        name: 'Row actions',
        required: true,
        description:
          '用方向中立的 X 移除、加号添加。启用重排时已选行末尾带重排手柄；保持原位的行没有手柄，转移约束会禁用移除操作。',
      },
      {
        name: 'Reorder hint',
        required: false,
        description:
          '已选行处于重排模式时：手柄下方的提示，其 Move up、Move down 和 Done 为按钮。',
      },
      {
        name: 'Bulk actions',
        required: false,
        description:
          '可选的 Clear 和 Add all 文字操作，遵守禁止转移的选项。',
      },
      {
        name: 'Apply and Cancel footer',
        required: false,
        description:
          '仅为分阶段行为渲染。Apply 提交有变更的草稿；Cancel 关闭且不改变已提交值。',
      },
      {
        name: 'Live announcements',
        required: true,
        description:
          '播报添加、移除、批量和重排结果，不单靠视觉位置传达。',
      },
    ],
  },
  // Mirrors the themeProps() calls in TransferList.tsx. `astryx theme build`
  // reads this inventory to learn which visual props a target can vary on, so
  // a target missing here cannot be themed even though it carries the class.
  theming: {
    targets: [
      {
        className: 'astryx-transfer-list',
        visualProps: [],
      },
      {
        className: 'astryx-transfer-list-collection',
        visualProps: [],
      },
      {
        className: 'astryx-transfer-list-panel',
        visualProps: ['side'],
      },
      {
        className: 'astryx-transfer-list-item',
        visualProps: ['side', 'state', 'reorder'],
      },
    ],
  },
  examples: [
    {
      label: '默认即时选择器',
      code: `const [fields, setFields] = useState(['name', 'status']);

<TransferListSelector
  label="Visible fields"
  description="Choose which fields appear. Changes take effect immediately."
  triggerLabel={fields.length + ' visible fields'}
  options={[
    {value: 'name', label: 'Name'},
    {value: 'status', label: 'Status'},
    {value: 'owner', label: 'Owner'},
  ]}
  value={fields}
  onChange={setFields}
  selectedLabel="Visible fields"
  availableLabel="Available fields"
  hasSelectAll
  hasClear
/>`,
    },
    {
      label: '分阶段提交',
      code: `const [fields, setFields] = useState(['name', 'status']);

<TransferListSelector
  label="Visible fields"
  description="Review the complete selection before applying it."
  options={fieldOptions}
  value={fields}
  onChange={setFields}
  commitBehavior="staged"
  selectedLabel="Visible fields"
  availableLabel="Available fields"
  hasSelectAll
  hasClear
/>`,
    },
    {
      label: '独立的转移与重排约束',
      code: `const reorderable = useMemo(
  () =>
    createReorderable<string>({
      onReorder: ({key, to}) => setFields(fields => moveTo(fields, key, to)),
      // Status keeps its place, but can be removed.
      isReorderable: value => value !== 'status',
    }),
  [],
);

<TransferListSelector
  label="Visible fields"
  options={[
    {
      value: 'name',
      label: 'Name',
      isTransferDisabled: true,
      disabledMessage: 'Name must remain visible.',
    },
    {value: 'status', label: 'Status'},
    {value: 'owner', label: 'Owner'},
  ]}
  reorderable={reorderable}
  value={fields}
  onChange={setFields}
/>`,
    },
    {
      label: '从 isReorderable 迁移到 reorderable',
      code: `// BEFORE: isReorderable turned reordering on, and an option opted out.
<TransferList
  options={[{value: 'name', label: 'Name', isReorderDisabled: true}, ...rest]}
  isReorderable
  value={fields}
  onChange={setFields}
/>;

// AFTER: reordering is opt-in through the object createReorderable makes.
const reorderable = useMemo(
  () =>
    createReorderable<string>({
      onReorder: ({key, to}) => setFields(fields => moveTo(fields, key, to)),
      isReorderable: value => value !== 'name',
    }),
  [],
);

<TransferList
  options={[{value: 'name', label: 'Name'}, ...rest]}
  reorderable={reorderable}
  value={fields}
  onChange={setFields}
/>;`,
    },
    {
      label: '自定义 ComplexSelector 中的保存视图',
      code: `const savedViews = {
  standard: ['name', 'status', 'owner'],
  ownership: ['name', 'owner', 'team'],
};
const [applied, setApplied] = useState(savedViews.standard);
const [draft, setDraft] = useState(applied);
const activeSavedView =
  Object.entries(savedViews).find(
    ([, columns]) =>
      columns.length === draft.length &&
      columns.every((column, index) => column === draft[index]),
  )?.[0] ?? 'custom';

function ResetDraftOnOpen({isOpen, value, onReset}) {
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      onReset([...value]);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, onReset, value]);

  return null;
}

<ComplexSelector
  label="View options"
  isLabelHidden
  triggerLabel="View options"
  value={applied}
  onChange={setApplied}>
  {(_appliedValue, commit, close, state) => (
    <>
      <ResetDraftOnOpen
        isOpen={state.isOpen}
        value={applied}
        onReset={setDraft}
      />
      <Selector
        label="Saved view"
        options={savedViewOptions}
        value={activeSavedView}
        onChange={nextSavedView => {
          setDraft(savedViews[nextSavedView]);
        }}
      />
      <TransferList
        label="Visible fields"
        isLabelHidden
        options={fieldOptions}
        value={draft}
        onChange={setDraft}
        selectedLabel="Visible fields"
        availableLabel="Available fields"
        hasSelectAll
        hasClear
      />
      <Button label="Cancel" variant="ghost" onClick={close} />
      <Button
        label="Apply"
        variant="primary"
        onClick={() => {
          commit(draft);
          close();
        }}
      />
    </>
  )}
</ComplexSelector>`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '默认即时提交的转移列表选择器，可选分阶段提交行为；TransferList 是高级自定义组合的原语',
  usage: {
    description:
      '默认以即时行为使用 TransferListSelector：每次列表编辑即提交，不渲染底栏。用分阶段行为审阅草稿并从 Apply 提交。仅在带保存视图、预设或自定义操作的的自定义 ComplexSelector 表面内直接用 TransferList。',
    bestPractices: [
      {
        guidance: true,
        description:
          '默认即时行为；每次编辑调用 onChange，轻拂关闭保留已提交变更。',
      },
      {
        guidance: true,
        description:
          '需要审阅或事务式持久化时用 commitBehavior="staged"；Apply 提交，Cancel/Escape/轻拂关闭丢弃。',
      },
      {
        guidance: true,
        description:
          '仅自定义保存视图、预设、头部或操作时才直接用 TransferList 加 ComplexSelector；打开时从已应用值重置草稿。',
      },
      {
        guidance: true,
        description:
          '独立设置转移与重排约束，用 disabledMessage 解释被锁定的转移。',
      },
      {
        guidance: true,
        description:
          '行保持单行；description 保持为可搜索元数据。',
      },
      {
        guidance: false,
        description:
          '不要把 commitBehavior 当作呈现/容器选择；两个值都用选择器 popover。',
      },
      {
        guidance: false,
        description: '不要用于少量简单选择；优先 CheckboxInput。',
      },
    ],
  },
  propDescriptions: {
    label: '外部字段标签与无障碍名称。',
    options:
      '完整选项池：value、label、description?、group?、isTransferDisabled?、disabledMessage?。',
    value: '按显示顺序排列的已提交选中值。',
    onChange:
      '即时行为中每次编辑调用，或分阶段行为中有变更的 Apply 调用。',
    commitBehavior:
      'TransferListSelectorCommitBehavior：immediate（默认，无底栏）或 staged（草稿加 Apply/Cancel）。',
    triggerLabel: '收起状态触发器内容；默认为已选数量。',
    description: 'popover 外的字段辅助说明。',
    isLabelHidden: '视觉上隐藏字段标签，保留其名称。',
    selectedLabel: '已选列表标题与名称。',
    availableLabel: '可选列表标题与名称。',
    hasSearch: '共享列表过滤器；默认 false。',
    searchLabel: '无障碍搜索标签。',
    searchPlaceholder: '搜索占位符。',
    reorderable:
      '用于行尾重排手柄的 createReorderable 对象（触摸按住、鼠标拖动、键盘）；其 isReorderable 决定哪些值可移动；分阶段移动改草稿；搜索时暂停。',
    hasSelectAll: '添加所有允许转移的可选选项。',
    hasClear: '移除所有允许转移的已选选项。',
    renderOption: '自定义行内容。',
    selectedEmptyText: '已选列表空消息。',
    availableEmptyText: '可选列表空消息。',
    noResultsText: '搜索无匹配消息。',
    applyLabel: '分阶段 Apply 标签；默认 Apply。',
    cancelLabel: '分阶段 Cancel 标签；默认 Cancel。',
    size: '字段与触发器尺寸。',
    width:
      '外部字段宽度；默认值匹配响应式 41rem 弹出层。',
    placement: 'Popover 相对触发器的放置位置。',
    isOptional: '标记字段可选。',
    isRequired: '标记字段必填。',
    isDisabled: '禁用选择器触发器和转移交互。',
    isLoading: '显示加载状态并禁用转移交互。',
    status: '字段校验状态。',
    statusVariant: '状态放置处理方式。',
    labelTooltip: '字段标签工具提示。',
    changeAction:
      '每次即时提交或有变更的分阶段 Apply 后的异步操作。',
    xstyle: '外部字段 StyleX 覆盖。',
    className: '外部字段 class 名。',
    style: '外部字段内联样式。',
    'data-testid': '选择器触发器测试 ID。',
  },
  components: [
    {
      name: 'TransferList',
      displayName: 'Transfer List',
      description:
        '供自定义 ComplexSelector 表面使用的底层受控内容；变更即时作用于其受控 value。',
      propDescriptions: {
        label: '控件的无障碍标签。',
        isLabelHidden: '视觉上隐藏控件标签，保留其名称。',
        description: '控件的辅助说明。',
        options: '带元数据、分组和转移约束的完整选项池。',
        value: '按显示顺序排列的选中值。',
        onChange:
          '每次添加/移除/批量变更后调用；移动传给 onReorder。',
        selectedLabel: '已选列表标题与名称。',
        availableLabel: '可选列表标题与名称。',
        hasSearch: '共享列表过滤器；默认 false。',
        isDisabled:
          '禁用所有控件；行和搜索保持可聚焦；默认 false。',
        searchLabel: '无障碍搜索标签。',
        searchPlaceholder: '搜索占位符。',
        reorderable:
          'createReorderable 对象（其 isReorderable 决定哪些值可移动；其 onReorder 收到以 value 为基准的 {key, to}）；搜索时暂停。',
        hasSelectAll: '添加所有允许转移的选项。',
        hasClear: '移除所有允许转移的已选选项。',
        renderOption: '自定义行内容。',
        selectedEmptyText: '已选列表空消息。',
        availableEmptyText: '可选列表空消息。',
        noResultsText: '搜索无匹配消息。',
        xstyle: 'TransferList 根元素的 StyleX 覆盖。',
      },
    },
  ],
};
