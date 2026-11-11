// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ListInput',
  displayName: 'List Input',
  group: 'ListInput',
  category: 'Form Controls',
  keywords: [
    'listinput',
    'list input',
    '列表输入',
    '可编辑列表',
    'repeatable fields',
    '重复字段',
    'field array',
    '字段数组',
    'collection input',
    '集合输入',
    'reorder',
    '重新排序',
    'guest list',
    '宾客名单',
    'traveler details',
    '出行人信息',
    'ListInput',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '命名整个集合的可见标签。同时为完整输入提供无障碍名称。',
      required: true,
    },
    {
      name: 'value',
      type: 'T[]',
      description:
        '当前的有序记录。ListInput 是受控组件，从不修改此数组或其中的记录。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(next: T[], change: ListInputChange<T>) => void',
      description:
        '在添加、更新或移除操作后以新数组调用。change 参数标识操作类型和受影响的记录。移动则改为传给 reorderable 对象。',
      required: true,
    },
    {
      name: 'getItemKey',
      type: '(item: T) => React.Key',
      description:
        '为每条记录返回稳定且唯一的 key。稳定的身份在记录移动时保持焦点与播报不丢失。',
      required: true,
    },
    {
      name: 'createItem',
      type: '() => T',
      description:
        '创建由内置添加操作插入的初始记录。返回一条已分配稳定 key 的新记录。',
      required: true,
    },
    {
      name: 'columns',
      type: 'ListInputColumn<T>[]',
      description:
        '每条记录显示的一致简单字段。列宽可配合 @astryxdesign/core/Table 的 proportional() 或 pixel() 调整宽度分布。ListInput 拥有可见的主色调列标签，渲染器的标签在语义上仍对辅助技术可用。在 640px 或更窄时，字段纵向堆叠，每条记录显示自己的字段标签，记录组使用 32px 垂直间距，行操作对齐在第一个字段旁。渲染器接收 isLabelHidden、完整的作用域校验状态、statusVariant 和 updateItem。',
      required: true,
    },
    {
      name: 'itemName',
      type: 'string',
      description:
        '内置操作标签与实时播报使用的单数名词，如 "Add guest" 中的 "guest"。',
    },
    {
      name: 'description',
      type: 'string',
      description:
        '显示在集合标签与其记录之间的辅助说明文字。',
    },
    {
      name: 'status',
      type: 'InputStatus',
      description:
        '为完整集合显示的列表级校验状态。错误会把集合标记为无效，并将消息关联到输入。',
    },
    {
      name: 'getItemStatus',
      type: '(item: T, index: number) => InputStatus | undefined',
      description:
        '返回单条完整记录的校验状态，如各字段单独有效但组合无效的情形。',
    },
    {
      name: 'getFieldStatus',
      type: '(item: T, columnKey: string, index: number) => InputStatus | undefined',
      description:
        '返回单个字段的校验状态。渲染器接收完整状态以及 statusVariant="tooltip"，并应将两者转发给其 Astryx 输入组件，让原生的状态呈现负责样式、描述、键盘访问和工具提示行为，且不改变行高。',
    },
    {
      name: 'reorderable',
      type: 'Reorderable',
      description:
        '让记录可重新排序：传入 createReorderable 创建的对象，以 getItemKey 为键。每条记录末尾（在 Remove 之后）带核心 List 的重排手柄，如同 UIKit 的重排控件位于编辑行末尾。手柄在记录被悬停或持有键盘焦点时出现，并在触摸屏上保持可见。在触摸屏上，先按住手柄片刻再拖动：记录停在原地并变暗，一个副本跟随手指移动，一条强调线标记落点；其他记录保持不动，列表在边缘附近自动滚动，松手后记录重新排列。轻扫手柄滚动列表，双指捏合缩放页面。鼠标则以同样方式立即拖动，记录直接就位，无位移动画。激活手柄（轻点、单击、Space 或 Enter）会为该记录开启重排模式：强调线标记记录位置，每次 Arrow Up 或 Arrow Down 移动一格，提示区以按钮形式显示移动和 Done，Escape 或 Done 结束模式并保留移动。对象的 isReorderable(key) 决定哪些记录可移动：被拒绝的记录没有手柄。每次移动传给对象的 onReorder({key, to})，to 是移动后记录在 value 中的索引。禁用或加载中的列表手柄仍可聚焦但移动无效。未提供时，记录保持原有顺序。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '禁用集合和所有内置操作。禁用状态也会传给每个列渲染器。',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '将集合标记为忙碌，在任务进行期间阻止变更。加载状态也会传给每个列渲染器。',
      default: 'false',
    },
    {
      name: 'maxItems',
      type: 'number',
      description:
        '可添加的最大记录数。数量达到上限后，内置添加操作不可用。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '在视觉上隐藏集合标签，同时保留其对辅助技术可见。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        '在集合标签旁显示可选标识。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '在集合标签旁显示必填标识，并将必填要求暴露给辅助技术。与 isOptional 互斥。',
      default: 'false',
    },
  ],
  usage: {
    description:
      'ListInput 编辑紧凑、有序且字段一致的记录集合，内置添加和移除操作，可选重排。渲染在列中的标准 Astryx 控件继承 medium 控件尺寸，使输入与添加、移除、重排和校验呈现对齐；显式指定的字段尺寸仍优先生效。指针激活会在 pointer-down 失焦或校验改变布局之前测量 Add 的位置，然后从最近的垂直滚动容器到最外层逐一调整，把 Add 保持在原视口位置。该校正仅在本次交互内生效，并在一个动画帧内复查，不做持久的滚动或尺寸监听。新增行以令牌化的位移动效进入；移除后，几何保持稳定的幸存行会动画移动到新位置。动效绝不延迟 onChange、焦点交接或播报；减弱动效偏好和不支持的浏览器使用即时变化。适用于少于七条记录、每条至多三个简单字段的列表，如宾客、出行人或标签选项。更大的集合用 Table；记录需要很多、复杂或不一致字段时用卡片或分步表单。',
    bestPractices: [
      {
        guidance: true,
        description:
          '使用稳定的记录 key 和一致的列，让焦点、校验和重排播报始终附着在正确的记录上。',
      },
      {
        guidance: true,
        description:
          '校验时机由应用掌控。错误应在失焦后出现时，以稳定的 item 和 column key 追踪已触碰字段；提交或服务器错误则允许立即显示。',
      },
      {
        guidance: true,
        description:
          '把校验放在最窄的有效层级：单值用字段状态，记录级问题用条目状态，集合级要求用列表状态。',
      },
      {
        guidance: true,
        description:
          '每个列渲染器都把 status 和 statusVariant 转发给渲染的 Astryx 输入组件，让字段消息使用控件原生的无障碍工具提示模式。',
      },
      {
        guidance: true,
        description:
          '让记录通过手柄重排：拖动在松手时上报一次移动，重排模式中每次按键移动立即上报一次，焦点保持在手柄上。',
      },
      {
        guidance: true,
        description:
          '集合动效保持信息性、不阻塞。新增活动行位移就位；移除行立即消失，尺寸稳定的幸存行补齐空隙。onChange、焦点和播报无需等待，减弱动效偏好下保持即时。',
      },
      {
        guidance: true,
        description:
          '保持连续指针添加的空间稳定：在 pointer-down 失焦或校验改变布局前测量 Add 的位置，再从最近的垂直滚动容器向外保持该视口位置。字段轻微裁剪不应让 Add 偏离指针；聚焦字段被实质性遮挡时仍以恢复其可见为先。键盘激活遵循正常焦点流。',
      },
      {
        guidance: false,
        description:
          '不要用于七条及以上记录或每条超过三个简单字段的场景；改用 Table 或专用编辑流程。',
      },
      {
        guidance: false,
        description:
          '不要为了强制最少数量而阻止移除；允许该操作，并用列表级校验说明由此产生的要求。',
      },
    ],
    anatomy: [
      {
        name: 'Label and description',
        required: true,
        description:
          '命名完整集合，并可选说明要添加什么记录。',
      },
      {
        name: 'First-record field labels',
        required: true,
        description:
          'ListInput 渲染主色调列标签，不带单独的表格外观，同时每个渲染控件的自身标签在视觉上隐藏、语义上保持关联。较宽时重复标签视觉隐藏；640px 或更窄字段堆叠时，每条记录显示自己的字段标签。',
      },
      {
        name: 'Record fields',
        required: true,
        description:
          '由使用方渲染的输入，接收作用域记录状态、完整校验状态、原生工具提示状态变体和更新行为。响应式堆叠时，标签与输入的间距最小，字段间距更大，记录组以 32px 间隔，让每个对象在视觉上保持区分。',
      },
      {
        name: 'Remove action',
        required: true,
        description:
          '立即移除所在记录，把焦点移到可预期的相邻控件，并在支持时让幸存行动画移动到新位置。记录被悬停或持有键盘焦点时显现，触摸屏上保持可见；静止时透明但保留其列和 Tab 顺序中的位置，因此字段永不移位。堆叠布局中，对齐在记录顶部第一个字段旁。',
      },
      {
        name: 'Reorder handle',
        required: false,
        description:
          '核心 List 的重排手柄，记录末尾 Remove 之后的三横线图标，位于 Remove 的单元格内，带命名记录及其位置的无障碍标签，无悬停工具提示。主指针为粗指针时，目标区域扩大到至少 44×44 px。记录被悬停或持有键盘焦点时显现，触摸屏上保持可见；静止时透明但保留在 Tab 顺序中。堆叠布局中位于记录顶部 Remove 旁。手指按住片刻再拖动；鼠标立即拖动；激活它（Space 或 Enter）开启重排模式，Arrow Up 和 Arrow Down 移动记录一格，Escape 结束模式。',
      },
      {
        name: 'Reorder-mode hint',
        required: false,
        description:
          '记录处于重排模式时，核心 List 锚定在手柄上的提示以按钮形式显示移动和 Done，仅靠点按即可重排。每个按钮的行为与其对应按键相同，焦点保持在手柄上。',
      },
      {
        name: 'Empty state',
        required: false,
        description:
          '没有记录时，居中的紧凑 EmptyState 为空集合命名，并引导用户使用添加操作。',
      },
      {
        name: 'Add action',
        required: true,
        description:
          '占满记录字段宽度，使用 ListInput 字段与操作共享的继承 medium 控件尺寸，并在未达 maxItems 时立即追加一条 createItem 创建的新记录。指针激活时，可用的垂直滚动容器从最近到最外层抵消插入高度，让操作保持在指针下方；键盘激活保持正常焦点行为，新聚焦字段的可见性始终优先。活动行在支持时使用令牌化位移入场动效，焦点不等动画完成即移到其第一个字段。',
      },
      {
        name: 'Validation messages',
        required: false,
        description:
          '说明字段级、条目级或列表级的错误、警告和成功状态。字段消息使用各输入原生的工具提示状态呈现，不改变行高。条目消息对齐记录字段，不延伸到移除控件下方。',
      },
    ],
  },
  theming: {
    targets: [
      {
        className: 'astryx-list-input',
        visualProps: ['state', 'reorderable'],
      },
    ],
  },
  examples: [
    {
      label: '标签选项',
      code: `import {createReorderable} from '@astryxdesign/core';
import {Selector} from '@astryxdesign/core/Selector';
import {proportional} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';

type TagOption = {id: string; color: string; label: string};

const columns = [
  {
    key: 'color',
    header: 'Color',
    width: proportional(1, {minWidth: 120}),
    renderInput: ({item, label, isLabelHidden, status, statusVariant, isDisabled, updateItem}) => (
      <Selector
        label={label}
        isLabelHidden={isLabelHidden}
        options={colorOptions}
        value={item.color}
        onChange={color => updateItem({...item, color}, 'color')}
        status={status}
        statusVariant={statusVariant}
        isDisabled={isDisabled}
      />
    ),
  },
  {
    key: 'label',
    header: 'Label',
    width: proportional(2, {minWidth: 200}),
    renderInput: ({item, label, isLabelHidden, status, statusVariant, isDisabled, updateItem}) => (
      <TextInput
        label={label}
        isLabelHidden={isLabelHidden}
        value={item.label}
        onChange={nextLabel => updateItem({...item, label: nextLabel}, 'label')}
        status={status}
        statusVariant={statusVariant}
        isDisabled={isDisabled}
      />
    ),
  },
] satisfies ListInputColumn<TagOption>[];

// Each move lands where ListInput reports it: the record's key and index.
const reorderable = useMemo(
  () =>
    createReorderable({
      onReorder: ({key, to}) =>
        setTags(tags => {
          const rest = tags.filter(tag => tag.id !== key);
          return [...rest.slice(0, to), ...tags.filter(tag => tag.id === key), ...rest.slice(to)];
        }),
    }),
  [],
);

<ListInput
  label="Tag options"
  itemName="tag"
  value={tags}
  onChange={setTags}
  getItemKey={tag => tag.id}
  createItem={() => ({id: crypto.randomUUID(), color: 'blue', label: ''})}
  columns={columns}
  reorderable={reorderable}
  status={
    tags.length < 5
      ? {type: 'error', message: 'Add at least five tag options.'}
      : undefined
  }
  getItemStatus={tag =>
    tag.color === 'green' && tag.label === 'Blocked'
      ? {type: 'error', message: '"Blocked" cannot use green.'}
      : undefined
  }
/>`,
    },
    {
      label: '受控宾客名单',
      code: `import {createReorderable} from '@astryxdesign/core';
import {proportional} from '@astryxdesign/core/Table';

type Guest = {id: string; name: string; email: string};

const columns = [
  {
    key: 'name',
    header: 'Name',
    width: proportional(1),
    renderInput: ({item, label, isLabelHidden, status, statusVariant, isDisabled, isLoading, updateItem}) => (
      <TextInput
        label={label}
        isLabelHidden={isLabelHidden}
        value={item.name}
        onChange={name => updateItem({...item, name}, 'name')}
        status={status}
        statusVariant={statusVariant}
        isDisabled={isDisabled}
        isLoading={isLoading}
      />
    ),
  },
  {
    key: 'email',
    header: 'Email',
    width: proportional(2),
    renderInput: ({item, label, isLabelHidden, status, statusVariant, isDisabled, isLoading, updateItem}) => (
      <TextInput
        type="email"
        label={label}
        isLabelHidden={isLabelHidden}
        value={item.email}
        onChange={email => updateItem({...item, email}, 'email')}
        status={status}
        statusVariant={statusVariant}
        isDisabled={isDisabled}
        isLoading={isLoading}
      />
    ),
  },
] satisfies ListInputColumn<Guest>[];

// Each move lands where ListInput reports it: the record's key and index.
const reorderable = useMemo(
  () =>
    createReorderable({
      onReorder: ({key, to}) =>
        setGuests(guests => {
          const rest = guests.filter(guest => guest.id !== key);
          return [...rest.slice(0, to), ...guests.filter(guest => guest.id === key), ...rest.slice(to)];
        }),
    }),
  [],
);

<ListInput
  label="Guests"
  itemName="guest"
  value={guests}
  onChange={setGuests}
  getItemKey={guest => guest.id}
  createItem={() => ({id: crypto.randomUUID(), name: '', email: ''})}
  columns={columns}
  reorderable={reorderable}
  maxItems={6}
  getFieldStatus={(guest, key) =>
    key === 'email' && guest.email === ''
      ? {type: 'error', message: 'Enter an email address'}
      : undefined
  }
  status={
    guests.length === 0
      ? {type: 'error', message: 'Add at least one guest'}
      : undefined
  }
/>`,
    },
    {
      label: '邮件列表',
      code: `import {TextInput} from '@astryxdesign/core/TextInput';

type Subscriber = {id: string; email: string};

<ListInput
  label="Mailing list"
  itemName="subscriber"
  value={subscribers}
  onChange={setSubscribers}
  getItemKey={subscriber => subscriber.id}
  createItem={() => ({id: crypto.randomUUID(), email: ''})}
  columns={[
    {
      key: 'email',
      header: 'Email address',
      renderInput: ({item, label, isLabelHidden, status, statusVariant, isDisabled, updateItem}) => (
        <TextInput
          type="email"
          label={label}
          isLabelHidden={isLabelHidden}
          value={item.email}
          onChange={email => updateItem({...item, email}, 'email')}
          status={status}
          statusVariant={statusVariant}
          isDisabled={isDisabled}
        />
      ),
    },
  ] satisfies ListInputColumn<Subscriber>[]}
  isRequired
  maxItems={6}
  getItemStatus={subscriber =>
    isDuplicateAddress(subscriber)
      ? {type: 'error', message: 'This address is already in the list.'}
      : undefined
  }
/>`,
    },
    {
      label: '预算分配',
      code: `import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Selector} from '@astryxdesign/core/Selector';
import {pixel, proportional} from '@astryxdesign/core/Table';

type Allocation = {id: string; team: string; percent: number | null};

const columns = [
  {
    key: 'team',
    header: 'Team',
    width: proportional(2, {minWidth: 180}),
    renderInput: ({item, label, isLabelHidden, status, statusVariant, isDisabled, updateItem}) => (
      <Selector
        label={label}
        isLabelHidden={isLabelHidden}
        options={teamOptions}
        value={item.team}
        placeholder="Choose a team"
        onChange={team => updateItem({...item, team}, 'team')}
        status={status}
        statusVariant={statusVariant}
        isDisabled={isDisabled}
      />
    ),
  },
  {
    key: 'percent',
    header: 'Allocation',
    width: pixel(132),
    renderInput: ({item, label, isLabelHidden, status, statusVariant, isDisabled, updateItem}) => (
      <NumberInput
        label={label}
        isLabelHidden={isLabelHidden}
        value={item.percent}
        onChange={percent => updateItem({...item, percent}, 'percent')}
        status={status}
        statusVariant={statusVariant}
        isDisabled={isDisabled}
        min={0}
        max={100}
        units="%"
        isIntegerOnly
      />
    ),
  },
] satisfies ListInputColumn<Allocation>[];

<ListInput
  label="Quarterly budget allocation"
  itemName="allocation"
  value={allocations}
  onChange={setAllocations}
  getItemKey={allocation => allocation.id}
  createItem={() => ({id: crypto.randomUUID(), team: '', percent: null})}
  columns={columns}
  maxItems={4}
  status={
    total === 100
      ? undefined
      : {type: 'error', message: 'Allocations must total 100%.'}
  }
/>`,
    },
    {
      label: '家庭成员申报',
      code: `import {DateInput} from '@astryxdesign/core/DateInput';
import {Selector} from '@astryxdesign/core/Selector';
import {pixel, proportional} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';

const columns = [
  {
    key: 'fullName',
    header: 'Full legal name',
    width: proportional(2, {minWidth: 200}),
    renderInput: ({item, label, isLabelHidden, status, statusVariant, isDisabled, updateItem}) => (
      <TextInput
        label={label}
        isLabelHidden={isLabelHidden}
        value={item.fullName}
        onChange={fullName => updateItem({...item, fullName}, 'fullName')}
        status={status}
        statusVariant={statusVariant}
        isDisabled={isDisabled}
      />
    ),
  },
  {
    key: 'relationship',
    header: 'Relationship',
    width: proportional(1.25, {minWidth: 160}),
    renderInput: ({item, label, isLabelHidden, status, statusVariant, isDisabled, updateItem}) => (
      <Selector
        label={label}
        isLabelHidden={isLabelHidden}
        options={relationshipOptions}
        value={item.relationship}
        onChange={relationship => updateItem({...item, relationship}, 'relationship')}
        status={status}
        statusVariant={statusVariant}
        isDisabled={isDisabled}
      />
    ),
  },
  {
    key: 'dateOfBirth',
    header: 'Date of birth',
    width: pixel(176),
    renderInput: ({item, label, isLabelHidden, status, statusVariant, isDisabled, updateItem}) => (
      <DateInput
        label={label}
        isLabelHidden={isLabelHidden}
        value={item.dateOfBirth}
        onChange={dateOfBirth => updateItem({...item, dateOfBirth}, 'dateOfBirth')}
        status={status}
        statusVariant={statusVariant}
        isDisabled={isDisabled}
      />
    ),
  },
] satisfies ListInputColumn<FamilyMember>[];

<ListInput
  label="Family member declaration"
  itemName="family member"
  value={members}
  onChange={setMembers}
  getItemKey={member => member.id}
  createItem={() => ({
    id: crypto.randomUUID(),
    fullName: '',
    relationship: '',
    dateOfBirth: undefined,
  })}
  columns={columns}
  isRequired
/>`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '受控的紧凑记录输入，带类型化列、令牌化的非阻塞添加/移除动效、可选重排，以及字段/条目/列表三级校验。',
  propDescriptions: {
    label: '集合标签与无障碍名称。',
    value: '受控的有序记录。',
    onChange: '发出新记录及添加/更新/移除元数据。',
    getItemKey: '必需的稳定唯一记录身份。',
    createItem: '为添加操作创建带 key 的新记录。',
    columns:
      '类型化简单字段：key、header、可选 proportional/pixel 宽度和 renderInput。ListInput 拥有可见列标签；窄屏记录堆叠，重复显示标签、加强间隔、行操作顶部对齐。渲染器转发 status 和 statusVariant。',
    itemName: '操作与播报使用的单数名词。',
    description: '标签下方的辅助说明文字。',
    status: '列表级 InputStatus。',
    getItemStatus: '按记录解析 InputStatus。',
    getFieldStatus:
      '按字段解析；完整状态加工具提示变体转发给渲染的输入组件。',
    reorderable:
      '以 getItemKey 为键的 createReorderable 对象：核心 List 的重排手柄位于每条记录末尾（Remove 之后），悬停/聚焦显现，触摸屏常显；触摸按住再拖，鼠标直接拖，键盘激活进入重排模式后用方向键，提示以按钮显示移动和 Done；记录变暗、副本跟随、线条标记落点，其他记录不动；每次移动传给对象的 onReorder({key, to})；其 isReorderable 可让记录不动；禁用或加载中手柄可聚焦但不生效。',
    isDisabled: '禁用集合、操作和渲染的输入。',
    isLoading: '标记忙碌并阻止变更。',
    maxItems: '达到上限时使添加不可用。',
    isLabelHidden: '仅视觉上隐藏标签。',
    isOptional: '显示可选标识；与 isRequired 互斥。',
    isRequired:
      '显示必填标识并向辅助技术暴露必填要求；与 isOptional 互斥。',
  },
  usage: {
    description:
      '适用于紧凑有序记录：少于 7 条，每条至多 3 个简单一致字段。添加/移除动效不延迟 onChange 或焦点，减弱动效时变为即时。更大或复杂数据用 Table 或专用流程。',
    bestPractices: [
      {
        guidance: true,
        description: '使用稳定 key 和一致的列。',
      },
      {
        guidance: true,
        description: '按需在字段、条目或列表层级校验。',
      },
      {
        guidance: true,
        description:
          '通过手柄重排；每次松手或按键移动调用一次 onReorder，不触发 onChange；焦点保持在手柄上。',
      },
      {
        guidance: true,
        description:
          '添加/移除动效保持非阻塞，减弱动效时即时完成。',
      },
      {
        guidance: false,
        description: '不要用于长数据集或复杂/不一致的记录。',
      },
      {
        guidance: false,
        description:
          '不要阻止移除来强制最少数量；改用列表级错误报告。',
      },
    ],
  },
};
